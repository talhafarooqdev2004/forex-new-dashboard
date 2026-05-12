"use client";

import { useEffect, useState } from "react";
import { Extension, type CommandProps } from "@tiptap/core";
import { Color } from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";
import { Image } from "@tiptap/extension-image";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Underline } from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const FontSize = Extension.create({
    name: "fontSize",

    addOptions() {
        return {
            types: ["textStyle"],
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: (element) => element.style.fontSize || null,
                        renderHTML: (attributes) => {
                            if (!attributes.fontSize) {
                                return {};
                            }

                            return {
                                style: `font-size: ${attributes.fontSize}`,
                            };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setFontSize:
                (fontSize: string) =>
                ({ chain }) =>
                    chain().setMark("textStyle", { fontSize }).run(),
            unsetFontSize:
                () =>
                ({ chain }) =>
                    chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
        };
    },
});

const LineHeight = Extension.create({
    name: "lineHeight",

    addOptions() {
        return {
            types: ["paragraph", "heading", "listItem"],
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    lineHeight: {
                        default: null,
                        parseHTML: (element) => element.style.lineHeight || null,
                        renderHTML: (attributes) => {
                            if (!attributes.lineHeight) {
                                return {};
                            }

                            return {
                                style: `line-height: ${attributes.lineHeight}`,
                            };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setLineHeight:
                (lineHeight: string) =>
                ({ chain }) =>
                    chain()
                        .updateAttributes("paragraph", { lineHeight })
                        .updateAttributes("heading", { lineHeight })
                        .updateAttributes("listItem", { lineHeight })
                        .run(),
            unsetLineHeight:
                () =>
                ({ chain }) =>
                    chain()
                        .updateAttributes("paragraph", { lineHeight: null })
                        .updateAttributes("heading", { lineHeight: null })
                        .updateAttributes("listItem", { lineHeight: null })
                        .run(),
        };
    },
});

type RichTextEditorProps = {
    value?: string;
    onChange: (content: string) => void;
};

const ensureDefaultColor = (html: string): string => {
    if (!html) {
        return html;
    }

    const defaultColor = "#FFFFFF";
    const textElements = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "span", "div", "td", "th"];

    textElements.forEach((tag) => {
        html = html.replace(
            new RegExp(`<${tag}(?![^>]*style[^>]*color[^>]*)([^>]*)>`, "gi"),
            (match, attrs) => {
                const styleMatch = attrs.match(/style\s*=\s*["']([^"']*)["']/i);

                if (styleMatch) {
                    const existingStyle = styleMatch[1];

                    if (!existingStyle.includes("color:")) {
                        const newStyle = existingStyle.trim().endsWith(";")
                            ? `${existingStyle} color: ${defaultColor}`
                            : `${existingStyle}; color: ${defaultColor}`;

                        return match.replace(/style\s*=\s*["'][^"']*["']/i, `style="${newStyle}"`);
                    }
                } else {
                    return `<${tag}${attrs} style="color: ${defaultColor}">`;
                }

                return match;
            },
        );
    });

    html = html.replace(/;\s*;/g, ";");
    html = html.replace(/\s*;\s*color:/g, "; color:");

    return html;
};

const DEFAULT_LINE_HEIGHT = "25px";
const DEFAULT_BODY_FONT_PT = "12pt";

const escapeHtml = (text: string): string =>
    text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const parseCssLengthToPx = (value: string): number => {
    const v = value.trim().toLowerCase();
    if (!v) {
        return 0;
    }
    if (v.endsWith("px")) {
        return Number.parseFloat(v) || 0;
    }
    if (v.endsWith("pt")) {
        return ((Number.parseFloat(v) || 0) * 96) / 72;
    }
    if (v.endsWith("rem")) {
        return (Number.parseFloat(v) || 0) * 16;
    }
    if (v.endsWith("em")) {
        return (Number.parseFloat(v) || 0) * 16;
    }
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : 0;
};

const isBoldStyle = (style: string): boolean => {
    const m = style.match(/font-weight:\s*([^;]+)/i);
    if (!m) {
        return false;
    }
    const w = m[1].trim().toLowerCase();
    if (w === "bold" || w === "bolder") {
        return true;
    }
    const n = Number.parseInt(w, 10);
    return Number.isFinite(n) && n >= 600;
};

const unwrapBlockquotesInFragment = (root: HTMLElement): void => {
    root.querySelectorAll("blockquote").forEach((bq) => {
        const parent = bq.parentNode;
        if (!parent) {
            return;
        }
        while (bq.firstChild) {
            parent.insertBefore(bq.firstChild, bq);
        }
        parent.removeChild(bq);
    });
};

const upgradePastedParagraphsToHeadings = (root: HTMLElement): void => {
    root.querySelectorAll("p").forEach((p) => {
        const style = p.getAttribute("style") || "";
        const fontSizePx = parseCssLengthToPx(style.match(/font-size:\s*([^;]+)/i)?.[1] ?? "");
        const bold = isBoldStyle(style);
        const classHint = (p.getAttribute("class") || "").toLowerCase();
        const looksLikeTitleClass = /heading|title|h1|h2|h3|display/i.test(classHint);

        const shouldH1 = fontSizePx >= 28 || (bold && fontSizePx >= 24);
        const shouldH2 =
            !shouldH1 && (fontSizePx >= 20 || looksLikeTitleClass || (bold && fontSizePx >= 16));
        const shouldH3 = !shouldH1 && !shouldH2 && fontSizePx >= 17;

        if (!shouldH1 && !shouldH2 && !shouldH3) {
            return;
        }

        const level = shouldH1 ? 1 : shouldH2 ? 2 : 3;
        const heading = document.createElement(`h${level}`);
        heading.innerHTML = p.innerHTML;

        const keep = style
            .split(";")
            .map((s) => s.trim())
            .filter((s) => {
                const key = s.split(":")[0]?.trim().toLowerCase() ?? "";
                return key && !["font-size", "font-weight", "line-height"].includes(key);
            })
            .join("; ");

        if (keep) {
            heading.setAttribute("style", keep);
        }

        p.replaceWith(heading);
    });
};

const processPastedHtmlDom = (html: string): string => {
    if (typeof document === "undefined" || !html.trim()) {
        return html;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div id="paste-root">${html}</div>`, "text/html");
    const root = doc.getElementById("paste-root");
    if (!root) {
        return html;
    }

    unwrapBlockquotesInFragment(root);
    upgradePastedParagraphsToHeadings(root);

    return root.innerHTML;
};

const addMissingFontSize = (html: string, defaultFontSize: string, tags: string[]): string => {
    let output = html;
    tags.forEach((tag) => {
        output = output.replace(
            new RegExp(`<${tag}(?![^>]*style[^>]*font-size[^>]*)([^>]*)>`, "gi"),
            (match, attrs) => {
                const styleMatch = attrs.match(/style\s*=\s*["']([^"']*)["']/i);
                if (styleMatch) {
                    const existingStyle = styleMatch[1];
                    if (!existingStyle.includes("font-size:")) {
                        const newStyle = existingStyle.trim().endsWith(";")
                            ? `${existingStyle} font-size: ${defaultFontSize}`
                            : `${existingStyle}; font-size: ${defaultFontSize}`;
                        return match.replace(/style\s*=\s*["'][^"']*["']/i, `style="${newStyle}"`);
                    }
                } else {
                    return `<${tag}${attrs} style="font-size: ${defaultFontSize}">`;
                }
                return match;
            },
        );
    });
    return output;
};

const addMissingLineHeight = (html: string, tags: string[], lineHeight: string): string => {
    let output = html;
    tags.forEach((tag) => {
        output = output.replace(
            new RegExp(`<${tag}(?![^>]*style[^>]*line-height[^>]*)([^>]*)>`, "gi"),
            (match, attrs) => {
                const styleMatch = attrs.match(/style\s*=\s*["']([^"']*)["']/i);
                if (styleMatch) {
                    const existingStyle = styleMatch[1];
                    if (!existingStyle.includes("line-height:")) {
                        const newStyle = existingStyle.trim().endsWith(";")
                            ? `${existingStyle} line-height: ${lineHeight}`
                            : `${existingStyle}; line-height: ${lineHeight}`;
                        return match.replace(/style\s*=\s*["'][^"']*["']/i, `style="${newStyle}"`);
                    }
                } else {
                    return `<${tag}${attrs} style="line-height: ${lineHeight}">`;
                }
                return match;
            },
        );
    });
    return output;
};

const forceTypographyForBodyTags = (html: string): string => {
    if (!html) {
        return html;
    }

    let output = html;
    ["p", "li", "td", "th"].forEach((tag) => {
        output = output.replace(new RegExp(`<${tag}([^>]*)>`, "gi"), (_match, attrs) => {
            const styleMatch = attrs.match(/style\s*=\s*["']([^"']*)["']/i);
            const mergedStyleParts = (
                styleMatch
                    ? styleMatch[1]
                          .split(";")
                          .map((item: string) => item.trim())
                          .filter(Boolean)
                          .filter((item: string) => {
                              const key = item.split(":")[0]?.trim().toLowerCase() ?? "";
                              return key !== "font-size" && key !== "line-height";
                          })
                    : []
            ).concat([`font-size: ${DEFAULT_BODY_FONT_PT}`, `line-height: ${DEFAULT_LINE_HEIGHT}`]);

            const nextStyle = mergedStyleParts.join("; ");
            if (styleMatch) {
                return `<${tag}${attrs.replace(/style\s*=\s*["'][^"']*["']/i, `style="${nextStyle}"`)}>`;
            }
            return `<${tag}${attrs} style="${nextStyle}">`;
        });
    });
    return output;
};

/** Load / sync from DB: body blocks get default size + line height; headings are not forced to body font-size. */
const ensureDefaultTypography = (html: string): string => {
    if (!html) {
        return html;
    }

    let output = ensureDefaultColor(html);
    const bodyFontTags = ["p", "li", "td", "th"];
    const lineHeightTags = ["p", "li", "h1", "h2", "h3", "h4", "h5", "h6"];

    output = addMissingFontSize(output, DEFAULT_BODY_FONT_PT, bodyFontTags);
    output = addMissingLineHeight(output, lineHeightTags, DEFAULT_LINE_HEIGHT);

    return output;
};

/** After paste: paragraphs at 12pt / 25px; headings keep semantic sizing (no body font-size forced on h1–h6). */
const ensurePasteTypography = (html: string): string => {
    if (!html) {
        return html;
    }

    let output = ensureDefaultColor(html);
    output = forceTypographyForBodyTags(output);
    output = addMissingLineHeight(output, ["p", "li", "h1", "h2", "h3", "h4", "h5", "h6"], DEFAULT_LINE_HEIGHT);
    return output;
};

const sanitizePastedHTML = (html: string): string => {
    if (!html) {
        return html;
    }

    const domProcessed = processPastedHtmlDom(html);
    return ensurePasteTypography(domProcessed);
};

const sanitizePastedText = (text: string): string => {
    if (!text) {
        return text;
    }
    return text
        .replace(/^\s*>\s?/gm, "")
        .replace(/\r\n/g, "\n");
};

const plainTextToHtml = (text: string): string => {
    const cleaned = sanitizePastedText(text).replace(/\r/g, "\n");
    const paragraphs = cleaned.split(/\n{2,}/);

    return paragraphs
        .map((paragraph) => {
            const lines = paragraph.split("\n").map((line) => escapeHtml(line));
            return `<p>${lines.join("<br>") || "<br>"}</p>`;
        })
        .join("");
};

const preserveEmptyParagraphs = (html: string): string => {
    if (!html) {
        return html;
    }

    return html.replace(/<p>\s*<\/p>/gi, `<p style="min-height:${DEFAULT_LINE_HEIGHT};line-height:${DEFAULT_LINE_HEIGHT}"><br></p>`);
};

const stripTextStyleFromCurrentTextblock = () => {
    return ({ tr, state }: CommandProps) => {
        const markType = state.schema.marks.textStyle;
        if (!markType) {
            return false;
        }

        const { $from } = state.selection;
        for (let depth = $from.depth; depth > 0; depth -= 1) {
            const node = $from.node(depth);
            if (node.isTextblock) {
                const start = $from.start(depth);
                const end = $from.end(depth);
                tr.removeMark(start, end, markType);
                return true;
            }
        }

        return false;
    };
};

const normalizeLineHeightInput = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) {
        return "";
    }

    if (/^\d+(\.\d+)?$/.test(trimmed)) {
        return `${trimmed}px`;
    }

    return trimmed;
};

export default function RichTextEditor({ value = "", onChange }: RichTextEditorProps) {
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        const updateTheme = () => {
            setIsDarkMode(document.documentElement.classList.contains("dark"));
        };

        updateTheme();
        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
                hardBreak: {
                    keepMarks: true,
                },
            }),
            TextStyle,
            FontSize,
            LineHeight,
            Color,
            FontFamily,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Underline,
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
        ],
        content: value,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "rich-text-prose",
                style: `color: #FFFFFF; font-size: ${DEFAULT_BODY_FONT_PT}; font-family: "Poppins", sans-serif; line-height: ${DEFAULT_LINE_HEIGHT}; padding: 12px; min-height: 500px; outline: none; border: none;`,
            },
            transformPastedHTML: (html) => sanitizePastedHTML(html),
            transformPastedText: (text) => sanitizePastedText(text),
        },
        onUpdate: ({ editor: currentEditor }) => {
            onChange(preserveEmptyParagraphs(currentEditor.getHTML()));
        },
    });

    useEffect(() => {
        if (editor && !editor.isFocused && editor.getHTML() !== value) {
            editor.commands.setContent(ensureDefaultTypography(preserveEmptyParagraphs(value)), {
                emitUpdate: false,
            });
        }
    }, [editor, value]);

    useEffect(() => {
        if (!editor) {
            return;
        }

        const handleDrop = (event: DragEvent) => {
            event.preventDefault();
            const files = event.dataTransfer?.files;

            if (!files?.length) {
                return;
            }

            const file = files[0];

            if (!file.type.startsWith("image/")) {
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert("Image size must be less than 5MB");
                return;
            }

            const reader = new FileReader();
            reader.onload = (loadEvent: ProgressEvent<FileReader>) => {
                const base64 = loadEvent.target?.result as string;

                if (base64) {
                    editor.chain().focus().setImage({ src: base64 }).run();
                }
            };
            reader.readAsDataURL(file);
        };

        const handleDragOver = (event: DragEvent) => {
            event.preventDefault();
        };

        const handlePaste = (event: ClipboardEvent) => {
            const items = event.clipboardData?.items;
            const clipboardData = event.clipboardData;

            if (!items || !clipboardData) {
                return;
            }

            for (let index = 0; index < items.length; index += 1) {
                const item = items[index];

                if (!item.type.startsWith("image/")) {
                    continue;
                }

                event.preventDefault();
                const file = item.getAsFile();

                if (!file) {
                    break;
                }

                if (file.size > 5 * 1024 * 1024) {
                    alert("Image size must be less than 5MB");
                    return;
                }

                const reader = new FileReader();
                reader.onload = (loadEvent: ProgressEvent<FileReader>) => {
                    const base64 = loadEvent.target?.result as string;

                    if (base64) {
                        editor.chain().focus().setImage({ src: base64 }).run();
                    }
                };
                reader.readAsDataURL(file);
                break;
            }

            const html = clipboardData.getData("text/html");
            const plainText = clipboardData.getData("text/plain");
            const hasStructuredHtml = /<(p|div|br|li|h[1-6]|blockquote|ul|ol|table)\b/i.test(html);
            const plainTextHasNewLines = /\n/.test(plainText);

            if (plainText && (!html || (plainTextHasNewLines && !hasStructuredHtml))) {
                event.preventDefault();
                const htmlFromText = plainTextToHtml(plainText);
                editor.chain().focus().insertContent(ensurePasteTypography(htmlFromText)).run();
            }
        };

        const editorElement = editor.view.dom;
        editorElement.addEventListener("drop", handleDrop);
        editorElement.addEventListener("dragover", handleDragOver);
        editorElement.addEventListener("paste", handlePaste);

        return () => {
            editorElement.removeEventListener("drop", handleDrop);
            editorElement.removeEventListener("dragover", handleDragOver);
            editorElement.removeEventListener("paste", handlePaste);
        };
    }, [editor]);

    if (!editor) {
        return (
            <div style={{ padding: "2rem", textAlign: "center", color: isDarkMode ? "#FFFFFF" : "#111827", minHeight: 200 }}>
                Loading editor...
            </div>
        );
    }

    const addImage = () => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");

        input.onchange = (event: Event) => {
            const target = event.target as HTMLInputElement;
            const file = target.files?.[0];

            if (!file) {
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert("Image size must be less than 5MB");
                return;
            }

            const reader = new FileReader();
            reader.onload = (loadEvent: ProgressEvent<FileReader>) => {
                const base64 = loadEvent.target?.result as string;

                if (base64) {
                    editor.chain().focus().setImage({ src: base64 }).run();
                }
            };
            reader.onerror = () => {
                alert("Failed to read image file");
            };
            reader.readAsDataURL(file);
        };

        input.click();
    };

    const setColor = (color: string) => {
        editor.chain().focus().setColor(color).run();
    };

    const setFontSize = (size: string) => {
        if (size) {
            editor.chain().focus().setFontSize(size).run();
        }
    };

    const setFontFamily = (family: string) => {
        if (family) {
            editor.chain().focus().setFontFamily(family).run();
        }
    };

    const editorWrapperStyle = {
        border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
        borderRadius: "8px",
        background: isDarkMode ? "#111827" : "#ffffff",
        overflow: "hidden",
    };

    const toolbarStyle = {
        display: "flex",
        flexWrap: "wrap" as const,
        gap: "8px",
        padding: "12px",
        background: isDarkMode ? "#0F172A" : "#f9fafb",
        borderBottom: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
    };

    const toolbarGroupStyle = {
        display: "flex",
        gap: "4px",
        alignItems: "center",
        paddingRight: "8px",
        borderRight: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
    };

    const buttonStyle = {
        padding: "6px 12px",
        background: isDarkMode ? "#1F2937" : "white",
        border: isDarkMode ? "1px solid #4B5563" : "1px solid #d1d5db",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "14px",
        color: isDarkMode ? "#F9FAFB" : "#374151",
        transition: "all 0.2s",
    };

    const activeButtonStyle = {
        ...buttonStyle,
        background: "#85BF58",
        color: "white",
        border: "1px solid #85BF58",
    };

    const selectStyle = {
        padding: "6px 8px",
        border: isDarkMode ? "1px solid #4B5563" : "1px solid #d1d5db",
        borderRadius: "4px",
        fontSize: "14px",
        color: isDarkMode ? "#F9FAFB" : "#374151",
        background: isDarkMode ? "#1F2937" : "white",
        cursor: "pointer",
        minWidth: "120px",
    };

    const colorInputStyle = {
        width: "40px",
        height: "32px",
        border: isDarkMode ? "1px solid #4B5563" : "1px solid #d1d5db",
        borderRadius: "4px",
        cursor: "pointer",
    };

    return (
        <div style={editorWrapperStyle}>
            <div style={toolbarStyle}>
                <div style={toolbarGroupStyle}>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        style={editor.isActive("bold") ? activeButtonStyle : buttonStyle}
                        title="Bold"
                    >
                        Bold
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        style={editor.isActive("italic") ? activeButtonStyle : buttonStyle}
                        title="Italic"
                    >
                        Italic
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        style={editor.isActive("underline") ? activeButtonStyle : buttonStyle}
                        title="Underline"
                    >
                        Underline
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        style={editor.isActive("strike") ? activeButtonStyle : buttonStyle}
                        title="Strikethrough"
                    >
                        Strike
                    </button>
                </div>

                <div style={toolbarGroupStyle}>
                    <select
                        onChange={(event) => {
                            const level = event.target.value;

                            if (level === "p") {
                                editor.chain().focus().command(stripTextStyleFromCurrentTextblock()).setParagraph().run();
                            } else if (level === "h1") {
                                editor.chain().focus().command(stripTextStyleFromCurrentTextblock()).setHeading({ level: 1 }).run();
                            } else if (level === "h2") {
                                editor.chain().focus().command(stripTextStyleFromCurrentTextblock()).setHeading({ level: 2 }).run();
                            } else if (level === "h3") {
                                editor.chain().focus().command(stripTextStyleFromCurrentTextblock()).setHeading({ level: 3 }).run();
                            }

                            setTimeout(() => {
                                event.target.value = "";
                            }, 0);
                        }}
                        defaultValue=""
                        title="Headings"
                        style={selectStyle}
                    >
                        <option value="">Headings</option>
                        <option value="h1">Heading 1</option>
                        <option value="h2">Heading 2</option>
                        <option value="h3">Heading 3</option>
                        <option value="p">Paragraph</option>
                    </select>
                </div>

                <div style={toolbarGroupStyle}>
                    <select
                        onChange={(event) => {
                            if (event.target.value) {
                                setFontSize(event.target.value);
                                setTimeout(() => {
                                    event.target.value = "";
                                }, 0);
                            }
                        }}
                        defaultValue=""
                        title="Font Size"
                        style={selectStyle}
                    >
                        <option value="">Font Size</option>
                        <option value="8pt">8pt</option>
                        <option value="10pt">10pt</option>
                        <option value="12pt">12pt</option>
                        <option value="14pt">14pt</option>
                        <option value="16pt">16pt</option>
                        <option value="18pt">18pt</option>
                        <option value="20pt">20pt</option>
                        <option value="24pt">24pt</option>
                        <option value="28pt">28pt</option>
                        <option value="32pt">32pt</option>
                        <option value="36pt">36pt</option>
                        <option value="48pt">48pt</option>
                        <option value="64pt">64pt</option>
                    </select>
                </div>

                <div style={toolbarGroupStyle}>
                    <select
                        onChange={(event) => {
                            if (event.target.value) {
                                setFontFamily(event.target.value);
                                setTimeout(() => {
                                    event.target.value = "";
                                }, 0);
                            }
                        }}
                        defaultValue=""
                        title="Font Family"
                        style={selectStyle}
                    >
                        <option value="">Font Family</option>
                        <option value={'"Poppins", sans-serif'}>Poppins</option>
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="Georgia, serif">Georgia</option>
                        <option value="Times New Roman, serif">Times New Roman</option>
                        <option value="Helvetica, sans-serif">Helvetica</option>
                        <option value="Verdana, sans-serif">Verdana</option>
                        <option value="Courier New, monospace">Courier New</option>
                        <option value="Comic Sans MS, cursive">Comic Sans MS</option>
                    </select>
                </div>

                <div style={toolbarGroupStyle}>
                    <input
                        type="color"
                        onChange={(event) => setColor(event.target.value)}
                        defaultValue="#FFFFFF"
                        title="Text Color"
                        style={colorInputStyle}
                    />
                </div>

                <div style={toolbarGroupStyle}>
                    <select
                        onChange={(event) => {
                            if (event.target.value) {
                                editor.chain().focus().setTextAlign(event.target.value).run();
                                setTimeout(() => {
                                    event.target.value = "";
                                }, 0);
                            }
                        }}
                        defaultValue=""
                        title="Text Alignment"
                        style={selectStyle}
                    >
                        <option value="">Text Align</option>
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                        <option value="justify">Justify</option>
                    </select>
                </div>

                <div style={{ ...toolbarGroupStyle, borderRight: "none" }}>
                    <button type="button" onClick={addImage} style={buttonStyle}>
                        Image
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        style={{
                            ...buttonStyle,
                            opacity: !editor.can().undo() ? 0.5 : 1,
                            cursor: !editor.can().undo() ? "not-allowed" : "pointer",
                        }}
                    >
                        Undo
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        style={{
                            ...buttonStyle,
                            opacity: !editor.can().redo() ? 0.5 : 1,
                            cursor: !editor.can().redo() ? "not-allowed" : "pointer",
                        }}
                    >
                        Redo
                    </button>
                </div>
            </div>

            <EditorContent editor={editor} />
        </div>
    );
}
