import xs, { Stream } from "xstream";
import { Command, PushCommand } from "cycle-native-navigation";
import { Reducer, Lens } from "cycle-onionify";
import { AppMetadata } from "../typings/messages";
import { InfoRes, InfoReq } from "./drivers/package-info";
import { State as AdditionState } from "./screens/addition";
import { State as CentralState } from "./screens/central";
import { State as DetailsState } from "./screens/details";

export type State = {
  apps: {
    [datHash: string]: AppMetadata;
  };
  selectedApp: string;
  addition: AdditionState;
};

export const centralLens: Lens<State, CentralState> = {
  get: (parent: State) => parent,

  set: (parent: State, child: CentralState) => {
    return { ...parent, apps: child.apps };
  },
};

// get-only lens
export const detailsLens: Lens<State, DetailsState> = {
  get: (parent: State) => ({
    app: parent.apps[parent.selectedApp] || { key: "", peers: 0 },
  }),

  set: (parent: State, child: DetailsState) => {
    return parent;
  },
};

export default function model(
  infoRes$: Stream<InfoRes>,
  navCommand$: Stream<Command>,
  newDat$: Stream<string>,
): Stream<Reducer<State>> {
  const initReducer$ = xs.of(function initReducer(prev: State): State {
    return (
      prev || {
        apps: {},
        selectedApp: "",
        addition: {
          textInput: "",
        },
      }
    );
  });

  const setSelectedAppReducer$ = navCommand$
    .filter(
      command =>
        command.type === "push" &&
        (command as PushCommand).screen === "DatInstaller.Details",
    )
    .map(
      (command: PushCommand) =>
        function setSelectedAppReducer(prev: State): State {
          return { ...prev, selectedApp: command.passProps.datHash };
        },
    );

  const packageInfoReducer$ = infoRes$.map(
    infoRes =>
      function packageInfoReducer(prev: State): State {
        const key = infoRes.datHash;
        const nextApps = { ...prev.apps };
        if (nextApps[key]) {
          nextApps[key].label = infoRes.info.label;
          nextApps[key].package = infoRes.info.package;
          nextApps[key].version = infoRes.info.versionName;
        }
        return { ...prev, apps: nextApps };
      },
  );

  const addDatReducer$ = newDat$.map(
    datAddress =>
      function addDatReducer(prev: State): State {
        const datHash =
          datAddress.length === 70 ? datAddress.substr(6, 70) : datAddress;
        if (!prev.apps[datHash]) {
          const next = { ...prev };
          next.apps[datHash] = {
            key: datHash,
            peers: 0,
          };
          return next;
        } else {
          return prev;
        }
      },
  );

  return xs.merge(
    initReducer$,
    setSelectedAppReducer$,
    packageInfoReducer$,
    addDatReducer$,
  );
}
