import { invoke } from '@tauri-apps/api/tauri'

export type CommandResult<T> =
    { success: T, error: undefined | null } |
    { error: { code: string, message: string } }

export interface ImageMetadata {
    format: string
    width: number
    height: number
    color_type: string
    channel_count: number
    bpp: number
    has_alpha: boolean
    has_color: boolean
}

export interface ImageDescriptor {
    thumbnail: string
    metadata: ImageMetadata
}

export async function createImageDescriptor(path: string, w: number): Promise<CommandResult<void>> {
    const result = await invoke('create_image_descriptor', { path, thumbnailWidth: w, thumbnailHeight: w });
    return result as any;
}

export async function imageDescriptor(path: string): Promise<CommandResult<ImageDescriptor>> {
    const result = await invoke('image_descriptor', { path });
    return result as any;
}