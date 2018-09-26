const initialState = {
  currentHour: new Date().getHours(),
}

export default function(state = initialState, action) {
  switch (action.type) {
    default:
      return state;
  }
}
