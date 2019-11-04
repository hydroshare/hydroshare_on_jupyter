import { Dispatch } from 'redux';
import {
    AllActionTypes,
} from './types';

function sleep(timeout: number) {
    return new Promise((resolve) => setTimeout(() => resolve(), timeout));
}

export async function addItemAsync(dispatch: Dispatch<AllActionTypes>, item: string) {
    // dispatch(actions.setLoading(true));

    await sleep(1000);

    // dispatch(actions.addItemToList(item));
    // dispatch(actions.setLoading(false));
}