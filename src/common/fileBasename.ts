export function fileBasename(path: string) {
    return path.slice(path.search(/[^\\/]+$/));
}