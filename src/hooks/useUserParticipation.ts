import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { CONTRACT_CONFIG } from '@/config/contract';

const PARTICIPANT_TYPE = `${CONTRACT_CONFIG.EVENT_PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::Participant`;
const SUBMISSION_TYPE = `${CONTRACT_CONFIG.EVENT_PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::Submission`;

export interface UserParticipation {
    joinedEventIds: string[];
    submittedEventIds: string[];
    participantObjects: Record<string, string>; // eventId -> participantObjectId
    submissionObjects: Record<string, string>; // eventId -> submissionObjectId
}

export const useUserParticipation = () => {
    const currentAccount = useCurrentAccount();

    // Query Participant objects
    const { data: participantData, isLoading: isLoadingParticipants, refetch: refetchParticipants } = useSuiClientQuery(
        'getOwnedObjects',
        {
            owner: currentAccount?.address || '',
            filter: { StructType: PARTICIPANT_TYPE },
            options: { showContent: true }
        },
        {
            enabled: !!currentAccount,
        }
    );

    // Query Submission objects
    const { data: submissionData, isLoading: isLoadingSubmissions, refetch: refetchSubmissions } = useSuiClientQuery(
        'getOwnedObjects',
        {
            owner: currentAccount?.address || '',
            filter: { StructType: SUBMISSION_TYPE },
            options: { showContent: true }
        },
        {
            enabled: !!currentAccount,
        }
    );

    const result: UserParticipation = {
        joinedEventIds: [],
        submittedEventIds: [],
        participantObjects: {},
        submissionObjects: {}
    };

    if (participantData?.data) {
        participantData.data.forEach((obj) => {
            const content = obj.data?.content;
            if (content?.dataType === 'moveObject') {
                // @ts-ignore - Dynamic fields access
                const eventId = content.fields.event_id;
                const objectId = obj.data?.objectId;

                if (eventId && objectId) {
                    result.joinedEventIds.push(eventId);
                    result.participantObjects[eventId] = objectId;
                }
            }
        });
    }

    if (submissionData?.data) {
        submissionData.data.forEach((obj) => {
            const content = obj.data?.content;
            if (content?.dataType === 'moveObject') {
                // @ts-ignore - Dynamic fields access
                const eventId = content.fields.event_id;
                const objectId = obj.data?.objectId;

                if (eventId && objectId) {
                    result.submittedEventIds.push(eventId);
                    result.submissionObjects[eventId] = objectId;
                }
            }
        });
    }

    return {
        ...result,
        isLoading: isLoadingParticipants || isLoadingSubmissions,
        refetch: async () => {
            await Promise.all([refetchParticipants(), refetchSubmissions()]);
        }
    };
};
