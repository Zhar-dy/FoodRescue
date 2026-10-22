export interface RegressionTree {
  childrenLeft: number[];
  childrenRight: number[];
  feature: number[];
  threshold: number[];
  value: number[];
}

/** Runs the learned splits exported by scikit-learn, not hand-authored rules. */
export function predictTree(tree: RegressionTree, features: number[]): number {
  let node = 0;
  for (let steps = 0; steps < tree.value.length; steps++) {
    if (tree.childrenLeft[node] === -1) {
      const value = tree.value[node];
      if (!Number.isFinite(value) || value < 0) throw new Error("Invalid trained-model output.");
      return value;
    }
    const feature = features[tree.feature[node]];
    if (!Number.isFinite(feature)) throw new Error("Invalid model input.");
    node = feature <= tree.threshold[node] ? tree.childrenLeft[node] : tree.childrenRight[node];
  }
  throw new Error("Invalid trained-model tree.");
}
