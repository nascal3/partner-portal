<template>
  <div>
    <v-card flat class="ma-0 pa-0">
      <v-card-title>
        <div>
          <h1 class="title font-weight-bold">
            {{ $t('orders.page_title') }}
          </h1>
        </div>
        <v-spacer></v-spacer>

        <div class="search-tenant-table">
          <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              :label="$t('orders.search')"
              @change="setSegmentEvent('Searched an order phrase')"
              single-line
              hide-details
              outlined
              clearable
              dense
          ></v-text-field>
        </div>

      </v-card-title>

      <v-divider></v-divider>

      <v-row class="mt-5 mb-1">
        <v-col md="6" cols="12">
          <v-row class="date-filters">
            <v-col cols="12" md="7">
              <date-range @getDateRange="setDateRange"/>
            </v-col>
            <v-col cols="12" md="5">
              <v-select
                  v-model="selectedDrivers"
                  :items="driversData"
                  item-text="name"
                  item-value="id"
                  :label="$t('orders.filter_by_driver')"
                  @change="getSelectedDrivers"
                  multiple
                  outlined
                  dense
              >
                <template v-slot:selection="{ item, index }">
                  <v-chip v-if="index === 0" small>
                    <span>{{ item.name }}</span>
                  </v-chip>
                  <span
                      v-if="index === 1"
                      class="grey--text text-caption"
                  >
                    +{{ selectedDrivers.length - 1 }} {{ $t('orders.other_drivers') }}
                  </span>
                </template>
              </v-select>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-spacer></v-spacer>

      <v-card-text class="px-0">
        <v-data-table
          id="orders-table"
          fixed-header
          disable-sort
          class="title"
          hide-default-footer
          disable-pagination
          :no-data-text="$t('orders.no_orders_found')"
          :no-results-text="$t('orders.no_results_found')"
          :headers="headers"
          :items="orders"
          :search="search"
          item-key="order_no"
          :expanded.sync="expanded"
          show-expand
          @item-expanded="getOrderDetails"
          :loading="loading"
          :loading-text="$t('core.system_loading')"
        >
          <template v-slot:item.destinations="{ item }">
            {{ getLastStop(item.destinations) }}
          </template>
          <template v-slot:item.updated_at="{ item }">
            {{ ordersDateFormat(item.updated_at) }}
          </template>
          <template v-slot:item.cost="{ item }">
            {{ item.currency }} {{ thousandSeparator(item.cost) }}
          </template>
          <template v-slot:item.status="{ item }">
            <v-chip :color="setChipColor(item.status)" :text-color="setChipTextColor(item.status)" light small>
              {{ item.status }}
            </v-chip>
          </template>
          <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length">
              <order-details :order-details-error="orderDetailsError" :order-details="orderDetails"/>
            </td>
          </template>
        </v-data-table>

        <app-pagination
          v-if="orders.length"
          id="orders-pagination"
          :meta="meta"
          @pageChanged="pageChanged"
        />
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import segmentMixin from "@/mixins/segmentEvents"
import formatNumbers from "@/mixins/formatNumbers"
import Order from '@/libs/app/orders/Order'
import OrderDetails from '@/libs/app/order_details/OrderDetails'
import User from '@/libs/app/users/User'
import dateFormat from "@/mixins/dateFormat"

export default {
  mixins: [segmentMixin, dateFormat, formatNumbers],

  components: {
    'order-details': () => import('./partials/OrderDetails'),
    'date-range': () => import('@/components/core/DateRange.vue'),
  },

  data () {
    return {
      loading: true,
      expanded: [],
      orderObj: new Order(),
      orderDetailsObj: new OrderDetails(),
      usersObj: new User(),
      orders: [],
      orderDetails: {},
      orderDetailsError: {},
      chipColor: 'error',
      chipTextColor: '#FFFFFF',
      menu: false,
      menu2: false,
      dateFrom: new Date().toISOString().substr(0, 10),
      dateTo: new Date().toISOString().substr(0, 10),
      minimumDate: '',
      maximumDate: '',
      locale: localStorage.getItem('setLanguage'),
      page: 1,
      search: '',
      driversData: [],
      selectedDrivers: [],
      headers: [
        { text: this.$t('orders.table_order_num'), value: 'order_no' },
        { text: this.$t('orders.table_pickup_location'), value: 'pickup_location' },
        { text: this.$t('orders.table_destination'), value: 'destinations' },
        { text: this.$t('orders.table_distance'), value: 'distance' },
        { text: this.$t('orders.table_pickup_date'), value: 'updated_at' },
        { text: this.$t('orders.table_price'), value: 'cost' },
        { text: this.$t('orders.table_status'), value: 'status' },
        { text: '', value: 'data-table-expand' }
      ],
      meta: {
        current_page: 1,
        first_page: 1,
        first_page_url: "/?page=1",
        last_page: 1,
        last_page_url: "/?page=1",
        next_page_url: null,
        per_page: 30,
        previous_page_url: null,
        total: 0
      }
    }
  },

  watch: {
    dateFrom (newDate) {
      this.minimumDate = newDate
    },

    dateTo (newDate) {
      this.maximumDate = newDate
    }
  },

  methods: {
    setDateRange({dateFrom, dateTo}) {
      this.dateFrom = dateFrom
      this.dateTo = dateTo
      this.loadOrders()
    },

    getOrderDetails ({item, value}) {
      if (!value) return
      this.setSegmentEvent('Viewed order details')
      const { order_no } = item
      this.orderDetailsObj.show(order_no).then( data => {
        this.orderDetails = data.data
      }).catch(error => {
        this.orderDetailsError = error
        throw error.data
      })
    },

    getSelectedDrivers () {
      this.setSegmentEvent('Filtered orders by driver')
      if (!this.selectedDrivers.length) return
      this.loadOrders()
    },

    getDriverIds () {
      return this.usersObj.show('?roles=driver').then(data => {
        if (this.selectedDrivers.length) return this.selectedDrivers
        this.driversData = data.data
        this.selectedDrivers = data.data
        return this.driversData.map(driver => {
          return driver.id
        })
      }).catch(error => {
        this.loading = false
        flash({
          message: error.data.message,
          color: '#e74c3c'
        })
      })
    },

    getLastStop(destinations) {
      if (!destinations.length) return
      return destinations[destinations.length - 1]
    },

    setChipColor (orderStatus) {
      if (orderStatus === 'pending') {
        return '#FDDB97'
      }
      if (orderStatus === 'confirmed') {
        return '#CCEFFF'
      }
      if (orderStatus === 'delivered') {
        return '#DEFAD2'
      }
      if (orderStatus === 'in transit') {
        return '#FDDB97'
      }
    },

    setChipTextColor (orderStatus) {
      if (orderStatus === 'pending') {
        return  '#9B101C'
      }
      if (orderStatus === 'confirmed') {
        return '#006492'
      }
      if (orderStatus === 'delivered') {
        return '#116F28'
      }
      if (orderStatus === 'in transit') {
        return '#9D5004'
      }
    },

    pageChanged (page) {
      this.page = page
      this.loadOrders()
    },

    formatOrders(ordersData) {
      if (!ordersData.length) return []
      let allOrders = []
      ordersData.forEach(order => {
        allOrders = [...allOrders, ...order.transporter_orders]
      })

      return allOrders.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
    },

    formatDriverIds(driverIds) {
      const IdsText = driverIds.toString()
      return IdsText.replaceAll(',', '|')
    },

    loadOrders () {
      this.loading = true
      this.getDriverIds().then(driverIds => {
        const Ids = this.formatDriverIds(driverIds)
        this.orderObj.show(this.dateFrom, this.dateTo, this.page, Ids).then(({ data }) => {
          this.orders = this.formatOrders(data)
          this.meta.total = this.orders.length
          this.loading = false
        }).catch(error => {
          this.loading = false
          flash({
            message: error.data.message,
            color: '#e74c3c',
          })
          throw error
        })
      }).catch(error => {
        this.loading = false
        flash({
          message: error.data.message,
          color: '#e74c3c',
        })
        throw error
      })
    },
  },

  mounted () {
    this.setSegmentEvent('Visited orders page')
    this.loadOrders()
  }

}
</script>

<style lang="scss">
  #orders-table {
    .v-data-table__wrapper {
      max-height: 90vh;
      overflow-x: hidden;
      overflow-y: auto;

      table {
        color: #909399;
        thead {
          tr {
            th:first-letter {
              text-transform: uppercase;
            }
          }
        }
        tbody {
          tr.v-data-table__expanded__content {
            background-color: #FFFFFF !important;
            box-shadow: none;
          }
          tr:nth-of-type(odd) {
            background-color: #F7F9FC;
          }
          tr {
            td.text-start:first-child {
              color: #606266;
              font-weight: 700;
            }
          }
        }
      }
    }
    .v-chip {
      .v-chip__content {
        padding-top: 2px;
        display: inline-block !important;
        &:first-letter {
          text-transform: uppercase;
        }
      }
    }
  }
  #orders-pagination {
    .v-pagination {
      justify-content: flex-end;
      padding-right: 20px;
      .v-pagination__navigation {
        box-shadow: none;
      }
      .v-pagination__item--active {
        color: #324BA8;
        background-color: transparent !important;
      }
      .v-pagination__item {
        background: transparent;
        font-weight: 700;
        box-shadow: none;
      }
    }
  }
</style>
<style lang="scss" scoped>
.search-tenant-table {
  width: 240px;
}
</style>
