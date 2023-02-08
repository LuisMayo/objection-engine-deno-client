import { amqp } from "../deps.ts";
import {
  ArgumentType,
  GenericRequest,
  GetMusicRequest,
  RenderArguments,
  RenderRequest,
} from "./objectionEngineTypes/oeArgs.ts";
import {
  GenericResponse,
  MusicResponse,
  RenderResponse,
  ResponseType,
  Status,
} from "./objectionEngineTypes/oeResponses.ts";
import { PromiseResolve } from "./promiseResolve.ts";
import { Queue } from "./queues.ts";
import { RPCArgs } from "./RPCArgs.ts";

export class OE_RPC_Client {
  private readonly encoder = new TextEncoder();
  private readonly decoder = new TextDecoder();
  private connection?: amqp.AmqpConnection;
  private channel?: amqp.AmqpChannel;
  private replyQueue?: amqp.QueueDeclareOk;
  private resolverMap = new Map<
    string,
    PromiseResolve<ResponseType, string>
  >();
  constructor(private rabbitURL?: string) {}
  async init() {
    this.connection = await amqp.connect(this.rabbitURL);
    this.channel = await this.connection.openChannel();
    this.replyQueue = await this.channel.declareQueue({ exclusive: true });
    this.setResponseHandler();
  }

  async close() {
    await this.channel?.close();
    await this.connection?.close();
  }

  private setResponseHandler() {
    if (!this.channel || !this.replyQueue) {
      throw "Connection not initialized";
    }
    this.channel.consume(
      { noAck: true, queue: this.replyQueue.queue },
      (_args, props, data) => {
        console.log("Response received!", data);
        const uuid = props.correlationId;
        if (!uuid || !this.resolverMap.has(uuid)) {
          console.error("Reply without valid ID received");
        } else {
          // The exclamation is in place since we just checked the map had the object
          const promResolver = this.resolverMap.get(uuid)!;
          try {
            const response: GenericResponse = JSON.parse(
              this.decoder.decode(data),
            );
            if (response.status === Status.SUCCESS) {
              promResolver.resolve(response.payload);
            } else {
              promResolver.reject(response.payload);
            }
          } catch (e) {
            console.error(e);
            promResolver.reject(e);
          } finally {
            this.resolverMap.delete(uuid);
          }
        }
      },
    );
  }

  private run<T extends ArgumentType>(
    queue: Queue,
    args?: RPCArgs,
    payload?: GenericRequest<T>,
  ): Promise<ResponseType> {
    return new Promise<ResponseType>((resolve, reject) => {
      if (this.channel == null || this.replyQueue == null) {
        return reject("RPC Client not initialized");
      }
      const uuid = crypto.randomUUID();
      this.channel.publish(
        { routingKey: queue },
        {
          contentType: "application/json",
          priority: args?.priority,
          replyTo: this.replyQueue.queue,
          correlationId: uuid,
        },
        this.encoder.encode(JSON.stringify(payload)),
      ).then(() => {
        const resolver = new PromiseResolve<ResponseType, string>(
          resolve,
          reject,
        );
        this.resolverMap.set(uuid, resolver);
        console.log("Waiting for message to come back");
      }).catch(reject);
    });
  }

  render(payload: RenderArguments, args?: RPCArgs): Promise<RenderResponse> {
    const request = new RenderRequest(payload);
    return this.run(Queue.slowQueue, args, request) as Promise<RenderResponse>;
  }

  getAvailableMusic(): Promise<MusicResponse> {
    const request = new GetMusicRequest();
    return this.run(Queue.fastQueue, undefined, request) as Promise<
      MusicResponse
    >;
  }

  async getQueueLength() {
    if (!this.channel) {
      throw new Error("RPC Client not initialized");
    }
    const queueDeclaration = await this.channel.declareQueue({
      passive: true,
      queue: Queue.slowQueue,
    });
    return Math.max(
      0,
      queueDeclaration.messageCount - queueDeclaration.consumerCount,
    );
  }

  computeBestPriority(args: { reptitions: number; msgLength: number }) {
    // Higher the better
    const repetitionsScore = 1 - args.reptitions;
    // Lower the betther
    const lengthScore = args.msgLength = Math.log1p(args.msgLength);
    // Lower the better
    let priority = Math.round(5 - repetitionsScore + lengthScore);
    priority = Math.max(1, priority);
    priority = Math.min(9, priority);
    return priority;
  }
}
