
const initialState = {
  isMIDIAccessible: false,
  isSettingsVisible: false,
  midiInputs: [],
  midiOutputs: [],
  midiSelectedInput: null,
  visibleHeight: 0,
  visibleWidth: 0,
};

/**
 * 
 * @param {Object} state 
 * @param {Object} action 
 * @param {String} action.type
 */
export default function reduce(state = initialState, action, actions = {}) {
  switch (action.type) {

    case actions.NEW_PROJECT: {
      const { bodies } = action;
      const { isMIDIAccessible, midiInputs = [], midiOutputs = [], visibleHeight, visibleWidth } = state;
      return { 
        ...initialState,
        bodies,
        isMIDIAccessible,
        joints: {
          allIds: [],
          byId: {},
        },
        midiInputs, 
        midiOutputs, 
        visibleHeight,
        visibleWidth,
      };
    }

    case actions.POPULATE: {
      const { bodies } = action;
      return { ...state, bodies, };
    }

    case actions.RESIZE: {
      const { visibleWidth, visibleHeight } = action;
      return { ...state, visibleWidth, visibleHeight };
    }

    case actions.SELECT_MIDI_INPUT: {
      return { ...state, midiSelectedInput: action.name, };
    }

    case actions.SET_MIDI_ACCESSIBLE: {
      const { value } = action;
      return { ...state, isMIDIAccessible: value };
    }

    case actions.SET_PROJECT: {
      const { isMIDIAccessible, midiInputs = [], midiOutputs = [], visibleWidth, visibleHeight } = state;
      return { 
        ...initialState,
        bodies: {
          allIds: [],
          byId: {},
        },
        joints: {
          allIds: [],
          byId: {},
        },
        ...state, 
        ...action.state,
        isMIDIAccessible, 
        midiInputs, 
        midiOutputs, 
        visibleHeight, 
        visibleWidth,
      };
    }

    case actions.TOGGLE_SETTINGS: {
      const { value } = action;
      return { ...state, isSettingsVisible: value };
    }

    case actions.UPDATE_MIDI_PORTS: {
      const { portNames, portType, } = action;
      const { midiInputs = [], midiOutputs = [], } = state;
      return {
        ...state,
        midiInputs: portType === 'input' ? [ ...portNames ] : midiInputs,
        midiOutputs: portType === 'output' ? [ ...portNames ] : midiOutputs,
      };
    }

    default:
      return state ? state : initialState;
  }
}
