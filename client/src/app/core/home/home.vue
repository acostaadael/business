<template>
  <div class="home">
    <div class="row" v-if="!authenticated">
      <div class="col-12">
        <div class="alert alert-info d-flex align-items-center justify-content-between">
          <div>
            <strong>Sesión requerida.</strong>
            <span class="ml-2">Inicia sesión para ver el dashboard de ventas.</span>
          </div>
          <b-button variant="primary" @click="openLogin">Iniciar sesión</b-button>
        </div>
      </div>
    </div>

    <div class="row" v-else>
      <div class="col-12">
        <div class="dashboard-title">
          <h2 class="mb-0">
            Dashboard de ventas
            <template v-if="ifOpenPeriod"> — {{ ifOpenPeriod.month }}/{{ ifOpenPeriod.year }}</template>
          </h2>
          <small class="text-muted">
            <template v-if="ifOpenPeriod">Período abierto</template>
            <template v-else>Resumen del período actual</template>
          </small>
        </div>
      </div>

      <div class="col-12" v-if="loadError">
        <div class="alert alert-danger">No se pudo cargar el dashboard: {{ loadError }}</div>
      </div>

      <div class="col-12" v-if="loading">
        <div class="text-muted">Cargando dashboard…</div>
      </div>

      <div class="col-12" v-if="dashboard && !loading">
        <div class="row">
          <div class="col-md-4 mb-3">
            <div class="card dashboard-card">
              <div class="card-body">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <div class="text-muted">Ventas del período</div>
                    <div class="h3 mb-0">{{ formatNumber(dashboard.totalSalesCount) }}</div>
                  </div>
                  <div class="dashboard-icon">
                    <font-awesome-icon icon="store" />
                  </div>
                </div>
                <div class="mt-3">
                  <SalesSparkline :values="salesDaySeries" />
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-4 mb-3">
            <div class="card dashboard-card">
              <div class="card-body">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <div class="text-muted">Mejor día</div>
                    <div class="h3 mb-0">
                      {{ bestDayLabel }}
                    </div>
                    <div class="text-muted small">{{ bestDayTotalLabel }}</div>
                  </div>
                  <div class="dashboard-icon">
                    <font-awesome-icon icon="calendar" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-4 mb-3">
            <div class="card dashboard-card">
              <div class="card-body">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <div class="text-muted">Top productos</div>
                    <div class="h3 mb-0">{{ dashboard.topProducts?.length ?? 0 }}</div>
                  </div>
                  <div class="dashboard-icon">
                    <font-awesome-icon icon="box" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-lg-7 mb-3">
            <div class="card">
              <div class="card-header d-flex align-items-center justify-content-between">
                <span>Ventas por día</span>
                <b-button size="sm" variant="outline-primary" @click="refresh">Actualizar</b-button>
              </div>
              <div class="card-body">
                <div class="chart-bar" v-if="salesByDayBars.length">
                  <div class="chart-bar__row" v-for="it in salesByDayBars" :key="it.day">
                    <div class="chart-bar__label">{{ it.day }}</div>
                    <div class="chart-bar__barWrap">
                      <div class="chart-bar__bar" :style="{ width: `${it.pct}%` }"></div>
                    </div>
                    <div class="chart-bar__value">{{ formatNumber(it.total) }}</div>
                  </div>
                </div>
                <div v-else class="text-muted">Aún no hay ventas registradas en el período.</div>
              </div>
            </div>
          </div>

          <div class="col-lg-5 mb-3">
            <div class="card">
              <div class="card-header">Top productos (cantidad)</div>
              <div class="card-body p-0">
                <table class="table mb-0">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th class="text-right">Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="p in dashboard.topProducts" :key="p.productId">
                      <td>{{ p.productName }}</td>
                      <td class="text-right">{{ formatNumber(p.total) }}</td>
                    </tr>
                    <tr v-if="!dashboard.topProducts?.length">
                      <td colspan="2" class="text-muted">Sin datos</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Component from './home.component';
export default Component;
</script>

<style scoped>
.home {
  padding: 0.5rem 0;
}

.dashboard-title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.dashboard-title h2 {
  color: #0f172a;
  font-weight: 700;
  font-size: 1.35rem;
}

.dashboard-card {
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
}

.dashboard-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(45, 120, 255, 0.12);
  color: #2d78ff;
  font-size: 18px;
}

.chart-bar__row {
  display: grid;
  grid-template-columns: 40px 1fr 80px;
  gap: 10px;
  align-items: center;
  margin: 8px 0;
}

.chart-bar__label {
  font-weight: 600;
  color: #2c3e50;
}

.chart-bar__barWrap {
  width: 100%;
  background: rgba(45, 120, 255, 0.12);
  border-radius: 999px;
  height: 10px;
  overflow: hidden;
}

.chart-bar__bar {
  height: 10px;
  background: #2d78ff;
  border-radius: 999px;
}

.chart-bar__value {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
</style>
