type Message = { message: string };
export function parseFieldErrors(errorString: string): Record<string, Message> {
        const errors: Record<string, Message> = {};

        const parts = errorString.split('; ');

        for (const part of parts) {
                const match = part.match(/^\[body\.(\w+)\]\s*(.+)$/);
                if (match) {
                        const [, field, message] = match;
                        errors[field] = { message };
                }
        }

        return errors;
}
