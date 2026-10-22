import { PredictionPanel } from "@/components/foodrescue/prediction-panel";
import { demoProduct } from "@/data/demo";

export default function PredictionsPage() {
  // P3 can supply its saved Product to the same panel once getProducts() exists.
  return <PredictionPanel product={demoProduct} isPreview />;
}
