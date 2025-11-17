import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainHeaderComponent } from '../main-header/main-header.component';
import { MainNavComponent } from '../main-nav/main-nav.component';
import { FooterComponent } from '../footer/footer.component';
import { AuthService } from '../services/auth.service';
import { VehicleService } from '../services/vehicle.service';
import { FuelService } from '../services/fuel.service';
import { MaintenanceService } from '../services/maintenance.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-analisis',
  standalone: true,
  imports: [CommonModule, MainHeaderComponent, MainNavComponent, FooterComponent],
  templateUrl: './analisis.component.html',
  styleUrl: './analisis.component.scss'
})
export class AnalisisComponent implements OnInit {
  currentUser: any = null;
  vehicles: any[] = [];
  
  // Métrica total
  gastoTotalMes: number = 0;
  
  // Métricas de combustible
  gastoMensualCombustible: number = 0;
  totalLitrosMes: number = 0;
  precioPromedioLitro: number = 0;
  
  // Métricas de mantenimiento
  gastoMensualMantenimiento: number = 0;
  totalMantenimientosMes: number = 0;

  // Porcentajes para barras de progreso
  porcentajeCombustible: number = 0;
  porcentajeMantenimiento: number = 0;

  // Ranking de vehículos
  vehiculosRanking: any[] = [];

  // Filtro de vehículo seleccionado
  selectedVehicleId: number | null = null;

  // Timeline de eventos
  timelineEvents: any[] = [];
  isTimelineExpanded: boolean = false;

  // Datos originales para filtrado
  allFuelData: any[] = [];
  allMaintenanceData: any[] = [];

  // Nuevas métricas
  gasolineraPreferida: string = '-';
  consumoPromedio: number = 0;
  vehiculoMasEconomico: any = null;
  diasDesdeUltimoMantenimiento: number = 0;
  tendenciaGasto: { porcentaje: number, tipo: 'aumento' | 'disminucion' | 'igual' } = { porcentaje: 0, tipo: 'igual' };
  kmRecorridosMes: number = 0;
  currentDay: number = new Date().getDate();

  constructor(
    private authService: AuthService,
    private vehicleService: VehicleService,
    private fuelService: FuelService,
    private maintenanceService: MaintenanceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar autenticación
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadData();
      }
    });
  }

  loadData(): void {
    // Cargar vehículos y datos de combustible/mantenimiento desde la base de datos
    forkJoin({
      vehicles: this.vehicleService.getVehicles(),
      fuel: this.fuelService.getAllFuelRefills(),
      maintenance: this.maintenanceService.getAllMaintenances()
    }).subscribe({
      next: (results) => {
        // Procesar vehículos
        if (results.vehicles) {
          this.vehicles = results.vehicles.vehicles || [];
        }

        // Guardar datos originales
        this.allFuelData = results.fuel.success && results.fuel.data ? results.fuel.data : [];
        this.allMaintenanceData = results.maintenance.success && results.maintenance.data ? results.maintenance.data : [];

        // Procesar con filtro inicial (todos los vehículos)
        this.applyVehicleFilter();
      },
      error: (err) => {
        console.error('Error loading data:', err);
      }
    });
  }

  updateGastoTotal(): void {
    this.gastoTotalMes = this.gastoMensualCombustible + this.gastoMensualMantenimiento;
    
    // Calcular porcentajes para barras de progreso
    if (this.gastoTotalMes > 0) {
      this.porcentajeCombustible = (this.gastoMensualCombustible / this.gastoTotalMes) * 100;
      this.porcentajeMantenimiento = (this.gastoMensualMantenimiento / this.gastoTotalMes) * 100;
    } else {
      this.porcentajeCombustible = 0;
      this.porcentajeMantenimiento = 0;
    }

    console.log('=== GASTO TOTAL MES ===');
    console.log('Combustible:', this.gastoMensualCombustible);
    console.log('Mantenimiento:', this.gastoMensualMantenimiento);
    console.log('TOTAL:', this.gastoTotalMes);
    console.log('======================');
  }

  calculateFuelMetrics(allRecords: any[]): void {
    // Calcular métricas totales (todos los registros)
    this.gastoMensualCombustible = allRecords.reduce((sum: number, record: any) => {
      const cost = parseFloat(record.totalCost?.toString() || '0');
      return sum + cost;
    }, 0);

    this.totalLitrosMes = allRecords.reduce((sum: number, record: any) => {
      const liters = parseFloat(record.liters?.toString() || '0');
      return sum + liters;
    }, 0);

    this.precioPromedioLitro = this.totalLitrosMes > 0 
      ? this.gastoMensualCombustible / this.totalLitrosMes 
      : 0;

    console.log('Fuel Metrics:', {
      gastoTotalCombustible: this.gastoMensualCombustible,
      totalLitros: this.totalLitrosMes,
      precioPromedioLitro: this.precioPromedioLitro,
      totalRecords: allRecords.length
    });
  }

  calculateMaintenanceMetrics(allRecords: any[]): void {
    // Calcular métricas totales (todos los registros)
    this.gastoMensualMantenimiento = allRecords.reduce((sum: number, record: any) => {
      const cost = parseFloat(record.cost?.toString() || '0');
      return sum + cost;
    }, 0);

    this.totalMantenimientosMes = allRecords.length;

    console.log('Maintenance Metrics:', {
      gastoTotalMantenimiento: this.gastoMensualMantenimiento,
      totalMantenimientos: this.totalMantenimientosMes,
      totalRecords: allRecords.length
    });
  }

  applyVehicleFilter(): void {
    // Filtrar datos según vehículo seleccionado
    let filteredFuel = this.allFuelData;
    let filteredMaintenance = this.allMaintenanceData;

    if (this.selectedVehicleId) {
      filteredFuel = this.allFuelData.filter(record => record.vehicleId === this.selectedVehicleId);
      filteredMaintenance = this.allMaintenanceData.filter(record => record.vehicleId === this.selectedVehicleId);
    }

    // Calcular métricas con datos filtrados
    this.calculateFuelMetrics(filteredFuel);
    this.calculateMaintenanceMetrics(filteredMaintenance);
    this.updateGastoTotal();
    this.calculateVehicleRanking(filteredFuel, filteredMaintenance);
    this.buildTimeline(filteredFuel, filteredMaintenance);
    
    // Calcular nuevas métricas
    this.calculateGasolineraPreferida(filteredFuel);
    this.calculateConsumoPromedio(filteredFuel);
    this.calculateVehiculoMasEconomico(filteredFuel);
    this.calculateDiasDesdeUltimoMantenimiento(filteredMaintenance);
    this.calculateTendenciaGasto(filteredFuel, filteredMaintenance);
    this.calculateKmRecorridosMes(filteredFuel);
  }

  onVehicleFilterChange(event: any): void {
    const value = event.target.value;
    this.selectedVehicleId = value === 'all' ? null : parseInt(value);
    this.applyVehicleFilter();
  }

  buildTimeline(fuelData: any[], maintenanceData: any[]): void {
    const events: any[] = [];

    // Agregar eventos de combustible
    fuelData.forEach(record => {
      events.push({
        date: new Date(record.date),
        type: 'fuel',
        icon: 'fa-gas-pump',
        iconColor: 'text-primary',
        title: 'Recarga de Combustible',
        vehicle: record.vehicle,
        amount: parseFloat(record.totalCost?.toString() || '0'),
        details: `${parseFloat(record.liters?.toString() || '0').toFixed(1)}L - ${record.station}`
      });
    });

    // Agregar eventos de mantenimiento
    maintenanceData.forEach(record => {
      events.push({
        date: new Date(record.date),
        type: 'maintenance',
        icon: 'fa-wrench',
        iconColor: 'text-danger',
        title: record.maintenanceType?.name || 'Mantenimiento',
        vehicle: record.vehicle,
        amount: parseFloat(record.cost?.toString() || '0'),
        details: record.workshopName || 'Sin taller especificado'
      });
    });

    // Ordenar por fecha descendente y tomar últimos 10
    this.timelineEvents = events
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);

    console.log('Timeline events:', this.timelineEvents);
  }

  calculateVehicleRanking(fuelData: any[], maintenanceData: any[]): void {
    // Crear un mapa de gastos por vehículo
    const vehicleGastos = new Map<number, { combustible: number, mantenimiento: number, total: number, vehicle: any }>();

    // Procesar combustible
    fuelData.forEach((record: any) => {
      const vehicleId = record.vehicleId;
      const cost = parseFloat(record.totalCost?.toString() || '0');
      
      if (!vehicleGastos.has(vehicleId)) {
        vehicleGastos.set(vehicleId, {
          combustible: 0,
          mantenimiento: 0,
          total: 0,
          vehicle: record.vehicle
        });
      }
      
      const current = vehicleGastos.get(vehicleId)!;
      current.combustible += cost;
      current.total += cost;
    });

    // Procesar mantenimiento
    maintenanceData.forEach((record: any) => {
      const vehicleId = record.vehicleId;
      const cost = parseFloat(record.cost?.toString() || '0');
      
      if (!vehicleGastos.has(vehicleId)) {
        vehicleGastos.set(vehicleId, {
          combustible: 0,
          mantenimiento: 0,
          total: 0,
          vehicle: record.vehicle
        });
      }
      
      const current = vehicleGastos.get(vehicleId)!;
      current.mantenimiento += cost;
      current.total += cost;
    });

    // Convertir a array y ordenar por gasto total (descendente)
    this.vehiculosRanking = Array.from(vehicleGastos.values())
      .sort((a, b) => b.total - a.total)
      .map((item, index) => ({
        position: index + 1,
        vehicle: item.vehicle,
        combustible: item.combustible,
        mantenimiento: item.mantenimiento,
        total: item.total
      }));

    console.log('Ranking de vehículos:', this.vehiculosRanking);
  }

  toggleTimeline(): void {
    this.isTimelineExpanded = !this.isTimelineExpanded;
  }

  calculateGasolineraPreferida(fuelData: any[]): void {
    if (fuelData.length === 0) {
      this.gasolineraPreferida = '-';
      return;
    }

    // Contar frecuencia de cada gasolinera
    const stationCount = new Map<string, number>();
    fuelData.forEach(record => {
      const station = record.station || 'Sin especificar';
      stationCount.set(station, (stationCount.get(station) || 0) + 1);
    });

    // Encontrar la más frecuente
    let maxCount = 0;
    let preferredStation = '-';
    stationCount.forEach((count, station) => {
      if (count > maxCount) {
        maxCount = count;
        preferredStation = station;
      }
    });

    this.gasolineraPreferida = `${preferredStation} (${maxCount} recargas)`;
  }

  calculateConsumoPromedio(fuelData: any[]): void {
    if (fuelData.length < 2) {
      this.consumoPromedio = 0;
      return;
    }

    // Ordenar por fecha
    const sortedRecords = [...fuelData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let totalKmRecorridos = 0;
    let totalLitros = 0;

    // Calcular km recorridos entre recargas y litros
    for (let i = 1; i < sortedRecords.length; i++) {
      const prevKm = sortedRecords[i - 1].currentKm || 0;
      const currentKm = sortedRecords[i].currentKm || 0;
      const litros = parseFloat(sortedRecords[i].liters?.toString() || '0');

      if (currentKm > prevKm) {
        totalKmRecorridos += (currentKm - prevKm);
        totalLitros += litros;
      }
    }

    // Calcular km/L
    this.consumoPromedio = totalLitros > 0 ? totalKmRecorridos / totalLitros : 0;
  }

  calculateVehiculoMasEconomico(fuelData: any[]): void {
    if (this.selectedVehicleId || this.vehicles.length === 0) {
      this.vehiculoMasEconomico = null;
      return;
    }

    // Calcular costo por km para cada vehículo
    const vehicleEfficiency = new Map<number, { vehicle: any, costoPorKm: number }>();

    this.vehicles.forEach(vehicle => {
      const vehicleFuel = fuelData.filter(r => r.vehicleId === vehicle.id);
      
      if (vehicleFuel.length === 0 || vehicle.currentKm === 0) {
        return;
      }

      const totalGasto = vehicleFuel.reduce((sum, r) => 
        sum + parseFloat(r.totalCost?.toString() || '0'), 0
      );

      const costoPorKm = totalGasto / vehicle.currentKm;

      vehicleEfficiency.set(vehicle.id, {
        vehicle: vehicle,
        costoPorKm: costoPorKm
      });
    });

    // Encontrar el más económico (menor costo por km)
    let minCostoPorKm = Infinity;
    let mostEconomical = null;

    vehicleEfficiency.forEach(data => {
      if (data.costoPorKm < minCostoPorKm) {
        minCostoPorKm = data.costoPorKm;
        mostEconomical = data;
      }
    });

    this.vehiculoMasEconomico = mostEconomical;
  }

  calculateDiasDesdeUltimoMantenimiento(maintenanceData: any[]): void {
    if (maintenanceData.length === 0) {
      this.diasDesdeUltimoMantenimiento = 0;
      return;
    }

    // Encontrar el mantenimiento más reciente
    const sortedMaintenance = [...maintenanceData].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const lastMaintenance = sortedMaintenance[0];
    const lastDate = new Date(lastMaintenance.date);
    const today = new Date();

    // Calcular diferencia en días
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    this.diasDesdeUltimoMantenimiento = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  calculateTendenciaGasto(fuelData: any[], maintenanceData: any[]): void {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Primer día del mes actual
    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    
    // Primer día del mes anterior
    const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfLastMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    // Calcular gastos del mes actual
    const currentMonthFuel = fuelData
      .filter(r => new Date(r.date) >= startOfCurrentMonth)
      .reduce((sum, r) => sum + parseFloat(r.totalCost?.toString() || '0'), 0);
    
    const currentMonthMaintenance = maintenanceData
      .filter(r => new Date(r.date) >= startOfCurrentMonth)
      .reduce((sum, r) => sum + parseFloat(r.cost?.toString() || '0'), 0);
    
    const currentMonthTotal = currentMonthFuel + currentMonthMaintenance;

    // Calcular gastos del mes anterior
    const lastMonthFuel = fuelData
      .filter(r => {
        const date = new Date(r.date);
        return date >= startOfLastMonth && date <= endOfLastMonth;
      })
      .reduce((sum, r) => sum + parseFloat(r.totalCost?.toString() || '0'), 0);
    
    const lastMonthMaintenance = maintenanceData
      .filter(r => {
        const date = new Date(r.date);
        return date >= startOfLastMonth && date <= endOfLastMonth;
      })
      .reduce((sum, r) => sum + parseFloat(r.cost?.toString() || '0'), 0);
    
    const lastMonthTotal = lastMonthFuel + lastMonthMaintenance;

    // Calcular tendencia
    if (lastMonthTotal === 0) {
      this.tendenciaGasto = { porcentaje: 0, tipo: 'igual' };
      return;
    }

    const diferencia = currentMonthTotal - lastMonthTotal;
    const porcentaje = Math.abs((diferencia / lastMonthTotal) * 100);

    if (diferencia > 0) {
      this.tendenciaGasto = { porcentaje, tipo: 'aumento' };
    } else if (diferencia < 0) {
      this.tendenciaGasto = { porcentaje, tipo: 'disminucion' };
    } else {
      this.tendenciaGasto = { porcentaje: 0, tipo: 'igual' };
    }
  }

  calculateKmRecorridosMes(fuelData: any[]): void {
    if (fuelData.length === 0) {
      this.kmRecorridosMes = 0;
      return;
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth, 1);

    // Filtrar registros del mes actual
    const currentMonthRecords = fuelData
      .filter(r => new Date(r.date) >= startOfMonth)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (currentMonthRecords.length === 0) {
      this.kmRecorridosMes = 0;
      return;
    }

    // Obtener el registro más antiguo y más reciente del mes
    const firstRecord = currentMonthRecords[0];
    const lastRecord = currentMonthRecords[currentMonthRecords.length - 1];

    // Calcular diferencia de kilometraje
    const kmInicial = firstRecord.currentKm || 0;
    const kmFinal = lastRecord.currentKm || 0;

    this.kmRecorridosMes = Math.max(0, kmFinal - kmInicial);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
