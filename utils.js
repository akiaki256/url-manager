// urlを受け取ってファビコンurlに加工して返す関数(sz=256)
export function convertToFavicon(url) {
    const domain = new URL(url).hostname;
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
    return faviconUrl
}
// 長過ぎるテキスト省略表示に変える
export function truncate(text, limit) {
    if (text.length <= limit) return text;
    return text.slice(0, limit) + '...';
}