import { RenderArguments } from "./oeArgs.ts";
import { ArgumentType } from "./oeArgs.ts";

export interface GenericSuccessResponse {
  status: Status.SUCCESS;
  payload: ResponseType;
}

export interface GenericErrorResponse {
  status: Status.ERROR;
  payload: string;
}

export type GenericResponse = GenericSuccessResponse | GenericErrorResponse;

export interface RenderResponse {
  url: string;
}

export interface MusicResponse {
  musicCodes: string[];
}

export type ResponseType = RenderResponse | MusicResponse;

// export type RealResponse<T extends ArgumentType> = T extends RenderArguments ? RenderResponse : MusicResponse;

export enum Status {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}
