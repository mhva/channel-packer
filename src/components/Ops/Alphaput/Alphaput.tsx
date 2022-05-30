import React, { useState } from 'react';
import ImageBrick from '../../ImageBrick';
import ImageDropzone, { DroppedImage, ImageProgress } from '../../ImageDropzone';
import './Alphaput.css';
export type AlphaputProps = {}

type ImageState = {
    loading: boolean
    image: DroppedImage | null
    progress: ImageProgress | null
}

export default function Alphaput(props: AlphaputProps) {
    const [images, setImages] = useState<ImageState[]>([
        { loading: false, image: null, progress: null },
        { loading: false, image: null, progress: null },
    ]);

    const handleFilesDropped = (i: number, files: ImageProgress[]) => {
        console.log("Received " + files.length + " files from dropzone:", files);
        const newImages = [...images];

        // When dropping a single image just place the new image in the square
        // it got dropped onto. Otherwise replace current set with the new ones.
        const imageMap = files.length === 1 ? [i] : [0, 1];

        for (let fileIndex = 0; fileIndex < imageMap.length; fileIndex++) {
            const imageIndex = imageMap[fileIndex];
            const file = files[fileIndex];

            newImages[imageIndex] = {
                ...images[imageIndex],
                loading: true,
                progress: file,
            };

            file.image.then(result => {
                console.log("Loaded file #" + imageIndex + ":", result);
                setImages(images => {
                    const newImages = [...images];
                    newImages[imageIndex] = {
                        ...images[imageIndex],
                        loading: false,
                        progress: null,
                        image: result.ok ? result.image : newImages[imageIndex].image,
                    };
                    return newImages;
                });
            });
        }

        setImages(newImages);
    };

    return <div className="Alphaput">
        {images.map((image, i) =>
            <ImageDropzone onDropped={handleFilesDropped.bind(null, i)} thumbnailSize={96} key={i}>
                {dragging =>
                    <ImageBrick dragging={dragging}
                                loading={image.loading}
                                image={image.image} />}
            </ImageDropzone>
        )}
    </div>
}