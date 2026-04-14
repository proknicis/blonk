"use client";

import { useEffect, useRef } from "react";
import styles from "./home.module.css";

export default function HeroVideo({ speed = 1 }: { speed?: number }) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = speed;
        }
    }, [speed]);

    return (
        <video
            ref={videoRef}
            className={styles.heroBgVideo}
            src="/hero-video.mp4"
            autoPlay
            loop
            muted
            playsInline
        />
    );
}
