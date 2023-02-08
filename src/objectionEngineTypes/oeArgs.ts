export interface GenericRequest<T extends ArgumentType> {
    method: Method;
    payload?: T;
}

export class RenderRequest implements GenericRequest<RenderArguments> {
    method = Method.RENDER;
    constructor(public payload: RenderArguments) {}
}

export class GetMusicRequest implements GenericRequest<GetMusicArguments> {
    method = Method.GET_MUSIC;
}


export class RenderArguments {
    output_filename?: string;
    music_code?: string;
    resolution_scale?: number;
    assigned_characters?: {[x: string]: string};
    adult_mode?: boolean;
    avoid_spoiler_sprites?: boolean;

    constructor(public comment_list: Comment[]) {}
}

export type GetMusicArguments = never;

export type ArgumentType = RenderArguments | GetMusicArguments;

export class Comment {
    user_id?: string;
    user_name?: string;
    text_content?: string;
    evidence_path?: string;
    score?: number;
}

export enum Method {
    RENDER = "render",
    GET_MUSIC ="getMusic"
}
