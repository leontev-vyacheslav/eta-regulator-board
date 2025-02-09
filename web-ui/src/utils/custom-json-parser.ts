export function parseCustomJson(jsonString: string): any {
    return JSON.parse(jsonString, (key, value) => {
        if (value === 'Infinity') {
            return Infinity;
        } else if (value === '-Infinity') {
            return -Infinity;
        } else {
            return value;
        }
    });
}