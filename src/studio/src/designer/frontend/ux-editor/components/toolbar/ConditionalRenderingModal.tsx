/* eslint-disable max-len */
/* eslint-disable no-undef */
import * as React from 'react';
import * as Modal from 'react-modal';
import { Typography } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { getLanguageFromKey } from 'app-shared/utils/language';
import ConditionalRenderingActionDispatchers from '../../actions/conditionalRenderingActions/conditionalRenderingActionDispatcher';
import { ConditionalRenderingComponent } from '../config/ConditionalRenderingComponent';
import RuleButton from './RuleButton';

export interface IConditionalRenderingModalProps {
  modalOpen: boolean;
  handleClose: () => void;
}

export default function ConditionalRenderingModal(props: IConditionalRenderingModalProps) {
  const [selectedConnectionId, setSelectedConnectionId] = React.useState<string>(null);
  const conditionalRendering = useSelector((state: IAppState) => state.serviceConfigurations.conditionalRendering);
  const language = useSelector((state: IAppState) => state.appData.language.language);

  function selectConnection(newSelectedConnectionId: string) {
    setSelectedConnectionId(newSelectedConnectionId);
    props.handleClose();
  }

  function handleClose() {
    setSelectedConnectionId(null);
    props.handleClose();
  }

  function handleSaveChange(newConnection: string) {
    ConditionalRenderingActionDispatchers.addConditionalRendering(newConnection);
    setSelectedConnectionId(null);
    props.handleClose();
  }

  function handleDeleteConnection(connectionId: string) {
    ConditionalRenderingActionDispatchers.delConditionalRendering(connectionId);
    setSelectedConnectionId(null);
    props.handleClose();
  }

  function renderConditionRuleConnections(): JSX.Element {
    if (!conditionalRendering || Object.getOwnPropertyNames(conditionalRendering).length === 0) {
      return (
        <Typography variant='caption'>
          {getLanguageFromKey('right_menu.rules_empty', language)}
        </Typography>
      );
    }
    return (
      <>
        {Object.keys(conditionalRendering || {}).map((key: string) => (
          <RuleButton
            text={conditionalRendering[key].selectedFunction}
            onClick={() => selectConnection(key)}
          />
        ))}
      </>
    );
  }
  return (
    <>
      <Modal
        isOpen={props.modalOpen}
        onRequestClose={handleClose}
        className='react-modal a-modal-content-target a-page a-current-page modalPage'
        ariaHideApp={false}
        overlayClassName='react-modal-overlay '
      >
        {selectedConnectionId ?
          <ConditionalRenderingComponent
            connectionId={selectedConnectionId}
            saveEdit={handleSaveChange}
            cancelEdit={handleClose}
            deleteConnection={handleDeleteConnection}
          />
          :
          <ConditionalRenderingComponent
            saveEdit={handleSaveChange}
            cancelEdit={handleClose}
            deleteConnection={(connectionId: any) => handleDeleteConnection(connectionId)}
          />
        }
      </Modal>
      {renderConditionRuleConnections()}
    </>
  );
}
