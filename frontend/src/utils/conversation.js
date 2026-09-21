export function getConversationPartner(conversation, myUserId) {
    if (
        !conversation ||
        !Array.isArray(conversation.members)
    ) {
        return null;
    }

    return (
        conversation.members
            .map((member) => member.user)
            .find((user) => user && user.id !== myUserId) || null
    );
}