async function fetchTrustScore(library: string): Promise<number> {
    return await Promise.resolve((Math.random() * 100) | 0); 
}

export { fetchTrustScore };
