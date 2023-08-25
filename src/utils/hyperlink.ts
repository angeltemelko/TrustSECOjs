function hyperlink(url: string, text: string): string {
    return `\u001b]8;;${url}\u001b\\${text}\u001b]8;;\u001b\\`;
}

export { hyperlink };
