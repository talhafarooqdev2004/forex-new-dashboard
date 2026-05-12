interface FJWidgets {
    createWidget(options: {
        container: string;
        mode: string;
        width: string;
        height: string;
        backColor: string;
        fontColor: string;
        widgetType: string;
    }): void;
}

declare global {
    interface Window {
        FJWidgets?: FJWidgets;
    }
}

export {};
