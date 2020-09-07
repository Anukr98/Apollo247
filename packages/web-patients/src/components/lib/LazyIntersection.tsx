import React, { useEffect, useState } from 'react';
import Image from './Image'
import useIO from './useIO'
const fallbackImage = require('images/ic_logo.png');

interface LazyIntersectionInterface {
    src: string;
    alt: string;
    style?: object;
    fallbackImage?: string;
}

export const LazyIntersection: React.FC<LazyIntersectionInterface> = (props) => {
    const [data, setData] = useState('')

    const [observer, setElements, entries] = useIO({
        threshold: 0.25,
        root: null
    })

    useEffect(() => {
        setData(props.src);
    }, [])

    useEffect(() => {
        let img = Array.from(document.getElementsByClassName('lazy'));
        setElements(img)
    }, [data, setElements])

    useEffect(() => {
        entries.forEach((entry: any) => {
            if (entry.isIntersecting) {
                let lazyImage = entry.target;
                lazyImage.src = lazyImage.dataset.src;
                lazyImage.classList.remove("lazy");
                observer.unobserve(lazyImage);
            }
        })
    }, [entries, observer])

    return (
        <Image
            src={props.src}
            fallbackSrc={props.fallbackImage || fallbackImage}
            isLazy
            style={props.style || {}}
            alt='thumbnails'
        />
    );
}