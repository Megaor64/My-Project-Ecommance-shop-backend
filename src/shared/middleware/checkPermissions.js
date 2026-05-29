export const checkPermissions = (req, res, next) => {
    const { id: userIdFromToken } = req.user
    const { id: userIdFromUrl } = req.params

    if (String(userIdFromToken) !== String(userIdFromUrl)) {
        return res.status(401).json({
            status: 401,
            message: `No permission`,
            data: null
        })
    }

    next()
}