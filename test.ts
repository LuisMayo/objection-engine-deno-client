import { Comment, RenderArguments } from "./src/objectionEngineTypes/oeArgs.ts";
import { OE_RPC_Client } from "./src/rpc-client.ts";
import { assert } from "https://deno.land/std@0.173.0/testing/asserts.ts";

Deno.test("Music test", async () => {
    const rpc = new OE_RPC_Client();
    await rpc.init();
    const music = await rpc.getAvailableMusic();
    assert(music && music.musicCodes && music.musicCodes.length > 0);
    await rpc.close();
});
// 

Deno.test("Render test", async () => {
    const rpc = new OE_RPC_Client();
    await rpc.init();
    const comment = new Comment();
    comment.score = 100;
    comment.text_content = "aaaaaa";
    comment.user_id="1"
    comment.user_name="Yassss"
    const args = new RenderArguments([comment]);
    args.resolution_scale = 2;
    args.adult_mode = true;
    // args.avoid_spoiler_sprites = true;
    args.music_code = "tat";
    args.output_filename="./test.mp4";
    const renderResponse = await rpc.render(args);
    assert(renderResponse && renderResponse.url && renderResponse.url === args.output_filename);
    await rpc.close();
});


