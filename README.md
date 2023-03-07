# objection-engine-deno-client
 A client library for https://github.com/LuisMayo/Objection-Engine-Rabbit-Worker
 More info: https://github.com/LuisMayo/objection-engine-docs

## Getting Started

### Prerequisites

 - [Deno Typescript runtime](https://deno.land/)
 - An AMQP broker. I personally use RabbitMQ
 - A working [objection engine worker](https://github.com/LuisMayo/Objection-Engine-Rabbit-Worker)

### Installing

1. Clone the repository

```
git clone https://github.com/LuisMayo/objection-engine-deno-client
```
2. Run the tests
``` bash
deno test --allow-read --allow-write --allow-net --allow-env test.ts
```

3. To use it as a library
``` typescript
import {  OE_RPC_Client, Comment } from "../deps.ts";
const rpc = new OE_RPC_Client();
await rpc.init();
rpc.getQueueLength().then((val) => {
  console.log(val)
});
rpc.render({
  comment_list: [new Comment()],
  avoid_spoiler_sprites: true,
  resolution_scale: 2,
  output_filename: 'test.mp4',
}, { priority: 5 }).then((value) => {
  console.log(value);
});
```

## Contributing
Since this is a tiny project we don't have strict rules about contributions. Just open a Pull Request to fix any of the project issues or any improvement you have percieved on your own. Any contributions which improve or fix the project will be accepted as long as they don't deviate too much from the project objectives. If you have doubts about whether the PR would be accepted or not you can open an issue before coding to ask for my opinion
