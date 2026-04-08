import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    className?: string;
    style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
    width = '100%', 
    height = '20px', 
    borderRadius = '8px', 
    className = '',
    style = {}
}) => {
    return (
        <div 
            className={`${styles.skeleton} ${className}`}
            style={{ 
                width, 
                height, 
                borderRadius,
                ...style 
            }}
        />
    );
};

export const SkeletonCircle: React.FC<Omit<SkeletonProps, 'width' | 'height' | 'borderRadius'>> = (props) => (
    <Skeleton width="48px" height="48px" borderRadius="50%" {...props} />
);

export const SkeletonRectangle: React.FC<SkeletonProps> = (props) => (
    <Skeleton height="150px" borderRadius="16px" {...props} />
);
