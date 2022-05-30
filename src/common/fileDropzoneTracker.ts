import { ImageMetadata } from "./api"

export type DroppedFile = {
    path: string
    name: string
    asset: string
}

export type FiledropEvent = {
    files: DroppedFile[]
}

export type FiledropHandler = (e: FiledropEvent) => void

class FileDropzoneTracker {
    handler: FiledropHandler | null
    timeout: NodeJS.Timeout | null

    constructor() {
        this.handler = null;
        this.timeout = null;
    }

    public getHandler() {
        return this.handler;
    }

    public enterDropzone(handler: FiledropHandler) {
        this.handler = handler;
    }

    public leaveDropzone() {
        // Don't let go of a handler yet to take care of the racy case when the dropLeave event
        // gets raised before the tauri file event. Obviously this is far from bulletproof but
        // it works reliably.
        this.timeout = setTimeout(() => this.handler = null, 16);
        this.handler = null;
    }
}

export const fileDropzoneTracker = new FileDropzoneTracker();
