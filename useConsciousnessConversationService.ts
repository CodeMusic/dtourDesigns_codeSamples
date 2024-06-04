import { create } from 'zustand';
import { useRouter } from 'next/navigation';
import { useAlertService } from '../_services';
import { useFetch } from '../_helpers/client';
import { Guid } from "guid-typescript";
import { debugLog } from '../_helpers/client/error-handler';

export { useConsciousnessConversationService };
// user state store
const initialState = {
    consciousnessConversations: undefined,
    consciousnessConversation: undefined,
};
const consciousnessConversationStore = create<ISimulatedConsciousnessStore>(() => initialState);

function useConsciousnessConversationService(): ISimulatedConsciousnessService {
    const alertService = useAlertService();
    const fetch = useFetch();
    const router = useRouter();
    //const searchParams = useSearchParams();
    const { consciousnessConversations, consciousnessConversation } = consciousnessConversationStore();

    return {
        consciousnessConversations,
        consciousnessConversation,
        getAll: async () => {
            consciousnessConversationStore.setState({ consciousnessConversations: await fetch.get('/api/consciousnessconversations') });
        },
        getAllForUser: async (userId) => {

            debugLog("Calling api at GET: /api/consciousnessconversations/user/$" + userId);
            consciousnessConversationStore.setState({ consciousnessConversations: await fetch.get(`/api/consciousnessconversations/user/${userId}`) });
        },
        getById: async (id) => {
            if (typeof id === 'string') {
                id = Guid.parse(id);
            }
            consciousnessConversationStore.setState({ consciousnessConversation: undefined });
            try 
            {
                consciousnessConversationStore.setState({ consciousnessConversation: await fetch.get(`/api/consciousnessconversations/${(id as any).value.toString()}`) });
            } 
            catch (error: any) 
            {
                alertService.error(error);
            }
        },
        create: async (consciousnessConversation) => {
            await fetch.post('/api/consciousnessconversations', consciousnessConversation);
        },
        update: async (id, params) => {
            if (typeof id === 'string') {
                id = Guid.parse(id);
            }
            console.log("Calling api at PUT: /api/consciousnessconversations/$" + (id as any).value.toString());
            await fetch.put(`/api/consciousnessconversations/${(id as any).value.toString()}`, params);
        },
        delete: async (id) => {
            if (typeof id === 'string') {
                id = Guid.parse(id);
            }
            console.log("Calling api at DELETE: /api/consciousnessconversations/$" + (id as any).value.toString());
            const response = await fetch.delete(`/api/consciousnessconversations/${(id as any).value.toString()}`);

            // remove deleted consciousnessConversation from state
            consciousnessConversationStore.setState({ consciousnessConversations: consciousnessConversations!.filter(x => x.id !== id) });
            router.push('/consciousnessconversations');
        }
    }
};


export interface IConsciousnessConversation 
{
    id: Guid;
    topic: string;
    userId: number;
    participant1: Guid;
    participant1ThreadId: string;
    participant2: Guid;
    participant2ThreadId: string;
}

interface ISimulatedConsciousnessStore 
{
    consciousnessConversations?: IConsciousnessConversation[];
    consciousnessConversation?: IConsciousnessConversation;    
}

interface ISimulatedConsciousnessService extends ISimulatedConsciousnessStore 
{
    getAll: () => Promise<void>;
    getAllForUser: (userId: number) => Promise<void>;
    getById: (id: Guid) => Promise<void>;
    create: (consciousnessConversation: IConsciousnessConversation) => Promise<void>;
    update: (id: Guid, params: Partial<IConsciousnessConversation>) => Promise<void>;
    delete: (id: Guid) => Promise<void>;
}

