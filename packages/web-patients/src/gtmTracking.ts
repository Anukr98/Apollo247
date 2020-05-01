export const gtmTracking = (gtmObj: any) => {
    const { category, action, label, value } = gtmObj
    try {
        window && window.gep && window.gep(category, action, label, value);
    } catch (err) {
        console.log('GTM ERROR: ', err)
    }
}