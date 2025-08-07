import { DataService, Car } from './DataService';

export interface MaintenanceRegulation {
  operation: string;
  mileage: string;
  period: string;
  notes: string;
}

export interface MaintenanceOperation {
  operation: string;
  mileage: number;
  period: number;
  notes: string;
  mileageUntilNext: number;
  monthsUntilNext: number;
  priority: 'high' | 'medium' | 'low';
  isDue: boolean;
}

export interface CarMaintenanceGuide {
  carId: string;
  brand: string;
  model: string;
  year: number;
  regulations: MaintenanceRegulation[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export class PMGService {
  /**
   * Get manufacturer-specific regulations for a car
   */
  static async getCarMaintenanceRegulations(carId: string): Promise<MaintenanceRegulation[]> {
    const car = await DataService.getCarById(carId);
    if (!car) {
      throw new Error('Car not found');
    }

    // Check if car has custom regulations
    const stored = localStorage.getItem(`car-maintenance-guide-${carId}`);
    if (stored) {
      try {
        const guide: CarMaintenanceGuide = JSON.parse(stored);
        return guide.regulations;
      } catch (error) {
        console.error('Error parsing stored car guide:', error);
      }
    }

    // Return manufacturer-specific default regulations
    return this.getManufacturerDefaultRegulations(car.brand, car.model, car.year);
  }

  /**
   * Get manufacturer-specific default regulations
   */
  static getManufacturerDefaultRegulations(brand: string, model: string, year: number): MaintenanceRegulation[] {
    // Honda-specific regulations (from reglament.json)
    if (brand.toLowerCase().includes('honda')) {
      return [
        {
          "operation": "Замена моторного масла и фильтра",
          "mileage": "10000",
          "period": "6",
          "notes": "Обязательно масло 0W-20/5W-30. При тяжёлых условиях - сократить до 8000 км"
        },
        {
          "operation": "Диагностика цепи ГРМ и натяжителя",
          "mileage": "60000",
          "period": "48",
          "notes": "Проверка натяжения цепи, износ направляющих и натяжителя. Обязательно при появлении шумов"
        },
        {
          "operation": "Замена воздушного фильтра двигателя",
          "mileage": "30000",
          "period": "24",
          "notes": "Критично для K24A1 из-за прямого забора воздуха"
        },
        {
          "operation": "Промывка системы VTEC",
          "mileage": "50000",
          "period": "36",
          "notes": "Чистка соленоида VTEC и сетки фильтра (характерная проблема K24)"
        },
        {
          "operation": "Замена свечей зажигания",
          "mileage": "100000",
          "period": "60",
          "notes": "NGK IZFR6K11. Обязательная замена по регламенту"
        },
        {
          "operation": "Замена тормозной жидкости",
          "mileage": "30000",
          "period": "24",
          "notes": "DOT 3/4. Гигроскопичность влияет на ABS"
        },
        {
          "operation": "Замена жидкости АКПП",
          "mileage": "60000",
          "period": "48",
          "notes": "Только Honda ATF DW-1."
        },
        {
          "operation": "Замена охлаждающей жидкости",
          "mileage": "100000",
          "period": "60",
          "notes": "Honda Type 2 (синяя). Не смешивать с другими типами!"
        },
        {
          "operation": "Регулировка клапанов",
          "mileage": "40000",
          "period": "36",
          "notes": "Требует специнструмента"
        },
        {
          "operation": "Замена ремня генератора",
          "mileage": "80000",
          "period": "60",
          "notes": "Контроль натяжителя и обводных роликов"
        },
        {
          "operation": "Чистка дроссельной заслонки",
          "mileage": "50000",
          "period": "36",
          "notes": "Характерная проблема K24 - нестабильные холостые обороты"
        },
        {
          "operation": "Диагностика подвески",
          "mileage": "20000",
          "period": "12",
          "notes": "Особое внимание задним рычагам (отзывная кампания HMC-2004-32)"
        }
      ];
    }

    // Toyota-specific regulations
    if (brand.toLowerCase().includes('toyota')) {
      return [
        {
          "operation": "Замена моторного масла и фильтра",
          "mileage": "10000",
          "period": "6",
          "notes": "Рекомендуется синтетическое масло 0W-20/5W-30"
        },
        {
          "operation": "Замена воздушного фильтра",
          "mileage": "30000",
          "period": "24",
          "notes": "Замена воздушного фильтра двигателя"
        },
        {
          "operation": "Замена тормозной жидкости",
          "mileage": "40000",
          "period": "24",
          "notes": "DOT 3/4. Замена тормозной жидкости"
        },
        {
          "operation": "Замена ремня ГРМ",
          "mileage": "90000",
          "period": "60",
          "notes": "Замена ремня ГРМ и натяжителя"
        },
        {
          "operation": "Замена свечей зажигания",
          "mileage": "120000",
          "period": "60",
          "notes": "Замена свечей зажигания"
        },
        {
          "operation": "Замена охлаждающей жидкости",
          "mileage": "100000",
          "period": "60",
          "notes": "Замена охлаждающей жидкости"
        }
      ];
    }

    // BMW-specific regulations
    if (brand.toLowerCase().includes('bmw')) {
      return [
        {
          "operation": "Замена моторного масла и фильтра",
          "mileage": "15000",
          "period": "12",
          "notes": "BMW LL-01/LL-04 масло. Интервал зависит от условий эксплуатации"
        },
        {
          "operation": "Замена тормозной жидкости",
          "mileage": "20000",
          "period": "24",
          "notes": "DOT 4. Обязательная замена каждые 2 года"
        },
        {
          "operation": "Замена воздушного фильтра",
          "mileage": "30000",
          "period": "24",
          "notes": "Замена воздушного фильтра двигателя"
        },
        {
          "operation": "Замена масляного фильтра",
          "mileage": "15000",
          "period": "12",
          "notes": "Замена масляного фильтра"
        },
        {
          "operation": "Проверка тормозных колодок",
          "mileage": "20000",
          "period": "12",
          "notes": "Проверка состояния тормозных колодок"
        }
      ];
    }

    // Mercedes-specific regulations
    if (brand.toLowerCase().includes('mercedes')) {
      return [
        {
          "operation": "Замена моторного масла и фильтра",
          "mileage": "20000",
          "period": "12",
          "notes": "MB 229.5 масло. Длинный интервал обслуживания"
        },
        {
          "operation": "Замена тормозной жидкости",
          "mileage": "20000",
          "period": "24",
          "notes": "DOT 4+. Замена каждые 2 года"
        },
        {
          "operation": "Замена воздушного фильтра",
          "mileage": "40000",
          "period": "24",
          "notes": "Замена воздушного фильтра двигателя"
        },
        {
          "operation": "Проверка тормозной системы",
          "mileage": "20000",
          "period": "12",
          "notes": "Проверка тормозных колодок и дисков"
        }
      ];
    }

    // Generic regulations for unknown manufacturers
    return [
      {
        "operation": "Замена моторного масла и фильтра",
        "mileage": "10000",
        "period": "6",
        "notes": "Стандартная замена масла и фильтра"
      },
      {
        "operation": "Замена воздушного фильтра",
        "mileage": "30000",
        "period": "24",
        "notes": "Замена воздушного фильтра двигателя"
      },
      {
        "operation": "Замена тормозной жидкости",
        "mileage": "30000",
        "period": "24",
        "notes": "Замена тормозной жидкости"
      },
      {
        "operation": "Замена свечей зажигания",
        "mileage": "60000",
        "period": "48",
        "notes": "Замена свечей зажигания"
      }
    ];
  }

  /**
   * Save car-specific maintenance guide
   */
  static async saveCarMaintenanceGuide(carId: string, regulations: MaintenanceRegulation[]): Promise<void> {
    const car = await DataService.getCarById(carId);
    if (!car) {
      throw new Error('Car not found');
    }

    const guide: CarMaintenanceGuide = {
      carId,
      brand: car.brand,
      model: car.model,
      year: car.year,
      regulations,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(`car-maintenance-guide-${carId}`, JSON.stringify(guide));
  }

  /**
   * Reset car to manufacturer default regulations
   */
  static async resetToManufacturerDefault(carId: string): Promise<void> {
    const car = await DataService.getCarById(carId);
    if (!car) {
      throw new Error('Car not found');
    }

    const defaultRegulations = this.getManufacturerDefaultRegulations(car.brand, car.model, car.year);
    await this.saveCarMaintenanceGuide(carId, defaultRegulations);
  }

  /**
   * Calculate maintenance due for a specific car
   */
  static async calculateMaintenanceDue(carId: string): Promise<MaintenanceOperation[]> {
    const car = await DataService.getCarById(carId);
    if (!car) {
      throw new Error('Car not found');
    }

    const regulations = await this.getCarMaintenanceRegulations(carId);
    const lastServiceDate = car.lastService ? new Date(car.lastService) : new Date(car.createdAt);

    return regulations.map(regulation => {
      const intervalMileage = parseInt(regulation.mileage);
      const intervalMonths = parseInt(regulation.period);

      // Calculate mileage-based intervals
      const mileageSinceLastService = car.mileage % intervalMileage;
      const mileageUntilNext = intervalMileage - mileageSinceLastService;

      // Calculate time-based intervals
      const monthsSinceService = Math.floor((Date.now() - lastServiceDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
      const monthsUntilNext = intervalMonths - (monthsSinceService % intervalMonths);

      // Determine priority and if due
      let priority: 'high' | 'medium' | 'low' = 'low';
      let isDue = false;

      if (mileageUntilNext <= 2000 || monthsUntilNext <= 1) {
        priority = 'high';
        isDue = mileageUntilNext <= 0 || monthsUntilNext <= 0;
      } else if (mileageUntilNext <= 5000 || monthsUntilNext <= 3) {
        priority = 'medium';
      }

      return {
        operation: regulation.operation,
        mileage: intervalMileage,
        period: intervalMonths,
        notes: regulation.notes,
        mileageUntilNext,
        monthsUntilNext,
        priority,
        isDue
      };
    });
  }

  /**
   * Get maintenance operations for service record dropdown
   */
  static async getServiceRecordOperations(carId: string): Promise<string[]> {
    const regulations = await this.getCarMaintenanceRegulations(carId);
    return regulations.map(reg => reg.operation);
  }

  /**
   * Get all available operation names (for management purposes)
   */
  static async getMaintenanceOperationNames(): Promise<string[]> {
    // Return a universal list of common maintenance operations
    return [
      "Замена моторного масла и фильтра",
      "Замена воздушного фильтра",
      "Замена топливного фильтра",
      "Замена масляного фильтра",
      "Замена тормозной жидкости",
      "Замена тормозных колодок",
      "Замена тормозных дисков",
      "Замена свечей зажигания",
      "Замена ремня ГРМ",
      "Замена ремня генератора",
      "Замена охлаждающей жидкости",
      "Замена жидкости АКПП",
      "Замена жидкости МКПП",
      "Регулировка клапанов",
      "Диагностика двигателя",
      "Диагностика подвески",
      "Диагностика тормозной системы",
      "Чистка дроссельной заслонки",
      "Промывка системы охлаждения",
      "Промывка топливной системы",
      "Развал-схождение",
      "Замена амортизаторов",
      "Замена сайлентблоков",
      "Замена шаровых опор",
      "Замена рулевых наконечников",
      "Замена подшипников ступиц",
      "Замена сальников",
      "Замена помпы",
      "Замена термостата",
      "Замена радиатора",
      "Замена кондиционера",
      "Замена аккумулятора",
      "Замена генератора",
      "Замена стартера",
      "Замена катушек зажигания",
      "Замена форсунок",
      "Замена топливного насоса",
      "Замена катализатора",
      "Замена глушителя",
      "Замена выхлопной системы",
      "Замена сцепления",
      "Замена коробки передач",
      "Замена дифференциала",
      "Замена карданного вала",
      "Замена полуосей",
      "Замена редуктора",
      "Замена раздаточной коробки",
      "Замена рулевой рейки",
      "Замена рулевого насоса",
      "Замена рулевого усилителя",
      "Замена тормозного цилиндра",
      "Замена тормозного суппорта",
      "Замена тормозного шланга",
      "Замена тормозного бачка",
      "Замена тормозного вакуумного усилителя",
      "Замена тормозного регулятора",
      "Замена тормозного датчика",
      "Замена тормозного блока",
      "Замена тормозного модуля",
      "Замена тормозного компьютера",
      "Замена тормозного провода",
      "Замена тормозного кабеля",
      "Замена тормозного рычага",
      "Замена тормозной педали",
      "Замена тормозного коврика",
      "Замена тормозного коврика",
      "Другое"
    ];
  }
} 