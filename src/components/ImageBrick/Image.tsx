import React from 'react';
import './ImageBrick.css';

export type ImageProps = {
    src: string
}

export default function Image(props: ImageProps) {
    return <div className="Image flex justify-center align-center bg-gray-900 overflow-hidden rounded-md">
        <img src={props.src} alt="" />
    </div>
}