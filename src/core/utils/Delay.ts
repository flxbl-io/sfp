export async function delay(ms: number = 0) {
    const timeout = !ms || isNaN(ms) ? 0 : ms;
    return new Promise((resolve) => setTimeout(resolve, timeout));
}
