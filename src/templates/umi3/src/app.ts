import 'yet-another-abortcontroller-polyfill';

export async function getInitialState() {
    return {
        user: JSON.parse(window.localStorage.getItem('user') || '')
    };
}
