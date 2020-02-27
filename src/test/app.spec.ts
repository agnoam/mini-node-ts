test('Simple greaterThan test', () => {
    const firstDate: number = Date.now();
    setTimeout(() => {
        const secondDate: number = Date.now();
        expect(secondDate).toBeGreaterThan(firstDate);
    }, 1);
});