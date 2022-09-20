import { Injectable } from '@nestjs/common'
import { CrmType, Order, OrdersFilter, RetailPagination } from './types'
import axios, { AxiosInstance } from 'axios'
import { ConcurrencyManager } from 'axios-concurrency'
import { serialize } from '../tools'
import { plainToClass } from 'class-transformer'

@Injectable()
export class RetailService {
  private readonly axios: AxiosInstance

  constructor() {
    this.axios = axios.create({
      baseURL: `${process.env.RETAIL_URL}/api/v5`,
      timeout: 10000,
      headers: {
        "X-API-KEY": process.env.RETAIL_KEY
      },
    })

    this.axios.interceptors.request.use((config) => {
      // console.log(config.url)
      return config
    })
    this.axios.interceptors.response.use(
      (r) => {
        // console.log("Result:", r.data)
        return r
      },
      (r) => {
        // console.log("Error:", r.response.data)
        return r
      },
    )
  }

  async orders(filter?: OrdersFilter): Promise<[Order[], RetailPagination]> {
    const params = serialize(filter, '')
    const resp = await this.axios.get('/orders?' + params)
    if (!resp.data) throw new Error('RETAIL CRM ERROR')

    const orders = plainToClass(Order, resp.data.orders as Array<any>)
    const pagination: RetailPagination = resp.data.pagination

    return [orders, pagination]
  }

  async findOrder(id: string): Promise<Order | null> {
    const params = serialize({by: 'id'}, '')
    const resp = await this.axios.get(`/orders/${id}?` + params)
    if (!resp.data?.order) throw new Error('RETAIL CRM ERROR')

    return resp.data.order
  }

  async orderStatuses(): Promise<CrmType[]> {
    const resp = await this.axios.get('/reference/statuses')
    if (!resp.data?.statuses) throw new Error('RETAIL CRM ERROR')
    return Object.values(resp.data.statuses)
  }

  async productStatuses(): Promise<CrmType[]> {
    const resp = await this.axios.get('/reference/product-statuses')
    if (!resp.data?.productStatuses) throw new Error('RETAIL CRM ERROR')
    return Object.values(resp.data.productStatuses)
  }

  async deliveryTypes(): Promise<CrmType[]> {
    const resp = await this.axios.get('/reference/delivery-types')
    if (!resp.data?.deliveryTypes) throw new Error('RETAIL CRM ERROR')
    return Object.values(resp.data.deliveryTypes)
  }
}
