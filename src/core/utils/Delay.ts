export async function delay(ms: number = 0) {
    const timeout = isNaN(ms) || ms === null || ms === undefined ? 0 : ms;
    return new Promise((resolve) => setTimeout(resolve, timeout));
}
