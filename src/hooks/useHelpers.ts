

export const useHelpers = () => {
    function isNullOrEmpty(value?: string | null) {
        return (
            value === null ||
            value === undefined ||
            (typeof value === "string" && value.trim() === "") ||
            (Array.isArray(value) && value.length === 0)
        );
    }

    return {
        isNullOrEmpty
    }
}