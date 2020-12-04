import { SagaIterator } from 'redux-saga';
import { call, fork, select, takeLatest } from 'redux-saga/effects';
import { put } from 'altinn-shared/utils';
import { IProcess } from 'altinn-shared/types';
import { IRuntimeState, ProcessSteps } from '../../../../types';
import { getCompleteProcessUrl } from '../../../../utils/urlHelper';
import * as ProcessStateActionTypes from '../processActionTypes';
import ProcessDispatcher from '../processDispatcher';
import InstanceDataActions from '../../instanceData/instanceDataActions';
import { IInstanceDataState } from '../../instanceData/instanceDataReducers';
import IsLoadingActions from '../../isLoading/isLoadingActions';
import QueueActions from '../../queue/queueActions';

const instanceDataSelector = (state: IRuntimeState) => state.instanceData;

export function* completeProcessSaga(): SagaIterator {
  try {
    const result: IProcess = yield call(put, getCompleteProcessUrl(), null);
    if (!result) {
      throw new Error('Error: no process returned.');
    }
    if (result.ended) {
      yield call(ProcessDispatcher.completeProcessFulfilled, ProcessSteps.Archived, null);
    } else {
      yield call(ProcessDispatcher.completeProcessFulfilled,
        result.currentTask.altinnTaskType as ProcessSteps,
        result.currentTask.elementId);
      if ((result.currentTask.altinnTaskType as ProcessSteps) === ProcessSteps.FormFilling) {
        yield call(IsLoadingActions.startDataTaskIsloading);
        yield call(QueueActions.startInitialDataTaskQueue);
        const instanceData: IInstanceDataState = yield select(instanceDataSelector);
        const [instanceOwner, instanceId] = instanceData.instance.id.split('/');
        yield call(
          InstanceDataActions.getInstanceData,
          instanceOwner,
          instanceId,
        );
      }
    }
  } catch (err) {
    yield call(ProcessDispatcher.completeProcessRejected, err);
  }
}

export function* watchCompleteProcessSaga(): SagaIterator {
  yield takeLatest(
    ProcessStateActionTypes.COMPLETE_PROCESS,
    completeProcessSaga,
  );
}

// WATCHES EXPORT
export function* processStateSagas(): SagaIterator {
  yield fork(watchCompleteProcessSaga);
  // Insert all watchSagas here
}
