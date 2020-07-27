import MithrilStream, { Stream } from 'mithril/stream';
import { merge } from '../utils/mergerino';
import {
  appStateMgmt,
  IAppStateActions,
  IAppStateModel,
} from './states/app-state';
import { FactoryComponent } from 'mithril';

export type StatePatch<S> = (state: S) => S;

export interface IAppModel extends IAppStateModel {}

export interface IActions extends IAppStateActions {}

export type ModelUpdateFunction = Partial<IAppModel> | StatePatch<IAppModel>;
// | ((model: Partial<IAppModel>) => Partial<IAppModel>);

export type UpdateStream = Stream<ModelUpdateFunction>;

export type MeiosisComponent = FactoryComponent<{
  state: IAppModel;
  actions: IActions;
}>;

const app = {
  initial: Object.assign({}, appStateMgmt.initial),
  actions: (update: UpdateStream) =>
    Object.assign({}, appStateMgmt.actions(update)) as IActions,
};

const update = MithrilStream<ModelUpdateFunction>();
export const states = MithrilStream.scan(merge, app.initial, update);
export const actions = app.actions(update);
