const app = svcConfig.VUE_APP_PORTAL

export const crypt = {
    /**
     * Encrypt the authenticated user's data
     */
    encrypt: (data) => {
        localStorage.setItem(app, JSON.stringify(data))
    },

    /**
     * Decrypt the authenticated user's data
     */
    decrypt: () => {
        const portal = localStorage.getItem(app)
        return portal ? JSON.parse(portal) : null
    },

    /**
     * Retrieves the user's properties from the encrypted string
     */
    retrieve: (key) => {
        const decrypted = crypt.decrypt()
        return decrypted ? decrypted[key] : null
    },
}