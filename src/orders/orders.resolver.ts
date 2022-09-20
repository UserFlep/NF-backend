import { Args, Query, Resolver } from '@nestjs/graphql'
import { RetailService } from '../retail_api/retail.service'
import { OrdersResponse } from '../graphql'
import { UseGuards } from '@nestjs/common'
import { AuthGuard } from 'src/common/auth.guard'

@UseGuards(AuthGuard)
@Resolver('Orders')
export class OrdersResolver {
  constructor(private retailService: RetailService) {}

  @Query()
  async order(@Args('number') id: string) {
    return this.retailService.findOrder(id)
  }

  @Query()
  async getOrders(@Args('page') page: number) {
    const [orders, pagination] = await this.retailService.orders({page})
    return {orders, pagination} as OrdersResponse
  }
}
