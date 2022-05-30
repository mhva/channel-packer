import React, { useCallback, useRef, useState } from 'react';
import { listen } from '@tauri-apps/api/event'
import { CommandResult, createImageDescriptor, imageDescriptor, ImageDescriptor } from '../../common/api';
import { DroppedFile, FiledropEvent, fileDropzoneTracker } from '../../common/fileDropzoneTracker';

export type ImageDropzoneProps = {
    thumbnailSize: number,
    children: (dragging: boolean) => JSX.Element
    onDropped: (files: ImageProgress[]) => void
}

export type DroppedImage = {
    file: DroppedFile
    descriptor: ImageDescriptor
}

export type ImageResult =
    { ok: true; image: DroppedImage } |
    { ok: false; message: string; file: DroppedFile }

export type ImageProgress = {
    file: DroppedFile
    image: Promise<ImageResult>
}

export default function ImageDropzone(props: ImageDropzoneProps) {
    const [dragging, setDragging] = useState(false);
    const draggingStateRef = useRef<boolean>(false);

    const handleFileDropped = useCallback(async (e: FiledropEvent) => {
        draggingStateRef.current = false;
        fileDropzoneTracker.leaveDropzone();

        if (!e.files.length)
            return;

        console.log('Dropzone: starting thumbnail gen (' + e.files.length + ' images)');
        console.time('Dropzone');

        const images = e.files.map((f): ImageProgress => ({
            file: f,
            image: (async (): Promise<ImageResult> => {
                const r = await imageDescriptor(f.path);
                if (!r.error || r.error.code !== 'not_cached')
                    return createImageResult(r, f);

                await createImageDescriptor(f.path, 96);

                return await new Promise<ImageResult>((resolve, _reject) => {
                    var interval = setInterval(async () => {
                        try {
                            const r = await imageDescriptor(f.path);
                            if (r.error && r.error.code === 'not_cached') {
                                console.log('Image is still loading:' + f.path);
                                return;
                            }

                            console.log('Image loading finished:', f.path, r);
                            clearInterval(interval);
                            resolve(createImageResult(r, f));
                        } catch (e: any) {
                            console.error('Image loading error:', f.path, e);
                            resolve({ ok: false, message: e?.toString() ?? "?", file: f });
                            clearInterval(interval);
                        }
                    }, 100);
                });
            })()
        }));

        console.log('Dropzone: before invoking handler');
        console.timeLog('Dropzone');

        props.onDropped(images);
        console.log('Dropzone: handler invoked');
        console.timeEnd('Dropzone');
    }, [props]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        draggingStateRef.current = true;
        setDragging(true);
        fileDropzoneTracker.enterDropzone(handleFileDropped);
    }, [handleFileDropped]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        draggingStateRef.current = false;
        setDragging(false);
        fileDropzoneTracker.leaveDropzone();
    }, []);

    if (draggingStateRef.current)
        fileDropzoneTracker.enterDropzone(handleFileDropped);

    return <div onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
        {props.children(dragging)}
    </div>
}

function createImageResult(r: CommandResult<ImageDescriptor>, f: DroppedFile): ImageResult {
    return !r.error
        ? { ok: true, image: { file: f, descriptor: r.success } }
        : { ok: false, message: r.error.message, file: f };
}