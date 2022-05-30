import React, { useState } from 'react';
import { DroppedFile } from '../../common/fileDropzoneTracker';
import { DroppedImage } from '../ImageDropzone';
import ImagePreview from './Image';
import './ImageBrick.css';

export type ImageBrickProps = {
    dragging?: boolean
    loading?: boolean
    image?: DroppedImage | null | undefined
}

type ImageBrickPlaceholderProps = {
    loading: boolean
}

type ImageBrickContentProps = {
    image: DroppedImage
}

export default function ImageBrick({ dragging, loading, image }: ImageBrickProps) {
    const highlightClass =
        dragging ? "border-blue-500" :
            !image ? "border-slate-500 border-dashed" :
                "border-transparent bg-gray-700 text-gray-200 shadow-md";

    return (
        <div className={`ImageBrick rounded border-2 p-2 ${highlightClass}`}>
            {!loading && image
                ? <ImageBrickContent image={image} />
                : <ImageBrickPlaceholder loading={!!loading} />}
        </div>
    );
}

function ImageBrickContent({ image }: ImageBrickContentProps) {
    const metadata = image.descriptor.metadata;

    return <div className="flex">
        <ImagePreview src={image.descriptor.thumbnail} />
        <div className="ml-2 overflow-hidden">
            <div className="whitespace-nowrap text-ellipsis" title={image.file.path}>
                <span className="inline-block text-teal-400 font-medium">{image.file.name}</span>
            </div>
            <div className="text-sm text-gray-400">
                {metadata.width}x{metadata.height} ({metadata.format}, {metadata.color_type})
            </div>
        </div>
    </div>
}

function ImageBrickPlaceholder(props: ImageBrickPlaceholderProps) {
    return <div className="ImageBrickPlaceholder flex justify-center items-center">
        {!props.loading ? "Drop image here" : <Spinner />}
    </div>
}

function Spinner() {
    return <div className="spinner">
        <div className="bounce1"></div>
        <div className="bounce2"></div>
        <div className="bounce3"></div>
    </div>
}