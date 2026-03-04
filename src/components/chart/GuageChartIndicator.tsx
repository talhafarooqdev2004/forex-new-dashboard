import styles from "./GuageChartIndicator.module.scss";

type CustomIndicatorStyle = {
    wrapperTransform?: string;
    needleTransform?: string;
    transformOrigin?: string;
    transition?: string;
    rotation?: number;
};

type IndicatorProps = {
    style: CustomIndicatorStyle | React.CSSProperties;
};

const extractRotationFromTransform = (transform?: string): number => {
    if (!transform) return 0;
    const match = transform.match(/rotate\(([-\d.]+)deg\)/);
    return match ? parseFloat(match[1]) : 0;
};

const extractRotationFromStyle = (style: React.CSSProperties): number => {
    if (style.transform && typeof style.transform === 'string') {
        return extractRotationFromTransform(style.transform);
    }
    return 0;
};

export default function GuageChartIndicator({ style }: IndicatorProps) {
    const isCustomStyle = (style: CustomIndicatorStyle | React.CSSProperties): style is CustomIndicatorStyle => {
        return 'wrapperTransform' in style || 'needleTransform' in style || 'rotation' in style;
    };

    const pivotX = 5.30035;
    const pivotY = 11.20868;

    let rotation = 0;
    if (isCustomStyle(style)) {
        if (style.rotation !== undefined) {
            rotation = style.rotation;
        } else if (style.needleTransform) {
            rotation = extractRotationFromTransform(style.needleTransform);
        }
    } else {
        rotation = extractRotationFromStyle(style);
    }

    const svgTransform = `rotate(${rotation} ${pivotX} ${pivotY})`;

    const svgStyle: React.CSSProperties = isCustomStyle(style)
        ? { transition: style.transition || 'transform 0.3s ease' }
        : {
            ...style,
            transform: undefined,
            transformOrigin: undefined,
        };

    if (isCustomStyle(style)) {
        return (
            <div
                className={styles.needleWrapper}
                style={{
                    transform: style.wrapperTransform,
                    transition: style.transition,
                    width: (style as React.CSSProperties & { width?: string }).width,
                    height: (style as React.CSSProperties & { height?: string }).height,
                }}
            >
                <svg
                    width="63"
                    height="12"
                    viewBox="0 0 63 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={styles.guageChartIndicator}
                    style={{ ...svgStyle, overflow: 'visible' }}
                >
                    <g transform={svgTransform}>
                        <ellipse cx="5.30035" cy="5.60434" rx="5.30035" ry="5.60434" fill="#010101" />
                        <path d="M10.6016 0.700684L62.9425 4.01234L10.6016 9.80774C13.7499 6.82725 11.9134 2.4945 10.6016 0.700684Z" fill="black" />
                    </g>
                </svg>
            </div>
        );
    }

    return (
        <div
            className={styles.needleWrapper}
            style={{
                width: (style as React.CSSProperties & { width?: string }).width,
                height: (style as React.CSSProperties & { height?: string }).height,
            }}
        >
            <svg
                width="63"
                height="12"
                viewBox="0 0 63 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={styles.guageChartIndicator}
                style={{ ...svgStyle, overflow: 'visible' }}
            >
                <g transform={svgTransform}>
                    <ellipse cx="5.30035" cy="5.60434" rx="5.30035" ry="5.60434" fill="#010101" />
                    <path d="M10.6016 0.700684L62.9425 4.01234L10.6016 9.80774C13.7499 6.82725 11.9134 2.4945 10.6016 0.700684Z" fill="black" />
                </g>
            </svg>
        </div>
    );
}
