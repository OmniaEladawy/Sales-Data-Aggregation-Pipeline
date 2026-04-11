//pipeline pattern
interface TransformationConfig {
  field?: string;
  condition?: string;
  [key: string]: any;
}

class Transformation {
  config: TransformationConfig;
  constructor(config: TransformationConfig) {
    this.config = config;
  }
  async transform(data: any): Promise<any> {
    throw new Error(
      `transform method must be implemented by ${this.constructor.name} Transformation`,
    );
  }
}

// 2-filter implementation
class FilterTransformation extends Transformation {
  async transform(data: any[]): Promise<any[]> {
    const { field, condition } = this.config;
    if (condition === "last24hours") {
      const cutOff = new Date();
      cutOff.setHours(cutOff.getHours() - 24);
      return data.filter((record) => {
        if (!field) {
          throw new Error("Field is undefined in FilterTransformation config.");
        }
        const recordTime = new Date(record[field]);
        return recordTime >= cutOff; // last 24 hours
      });
    }
    return data;
  }
}

// const adjustingToUI = pipeline(nomralize, filter, aggregate, z);

// return adjusstingToUI(data);

// (data) =>
//   data
//     .map((input) => input.normalize())
//     .filter(new FilterTransformation())
//     .join(new Aggreagaror());
