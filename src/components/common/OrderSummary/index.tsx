import classes from './OrderSummary.module.scss';
import { Currency } from '../Currency';
import { OrderModel } from '@/domain/OrderModel';
import { useTranslation } from 'react-i18next';

interface OrderSummaryProps {
  order: OrderModel;
  showFreeWhenZeroTotal?: boolean;
}

export const OrderSummary = ({
  order,
  showFreeWhenZeroTotal = true,
}: OrderSummaryProps) => {
  const { t } = useTranslation();
  return (
    <div className={classes.summary}>
      <div className={classes.items}>
        {order?.items?.map((item) => {
          return (
            <div key={item.id} className={classes.itemRow}>
              {/* eslint-disable-next-line lingui/no-unlocalized-strings */}
              <div className={classes.itemName}>
                {item.quantity} x {item.name}
              </div>
              <div className={classes.itemValue}>
                {!!item.price && (
                  <div
                    style={{
                      color: '#888',
                      marginRight: '5px',
                      display: 'inline-block',
                    }}
                  >
                    <Currency
                      currency={'VND'}
                      price={item.price * item.quantity}
                      strikeThrough
                    />
                  </div>
                )}
                <Currency currency={'VND'} price={item.price * item.quantity} />
              </div>
            </div>
          );
        })}
        <div className={classes.separator} />
        <div className={classes.itemRow}>
          <div className={classes.itemName}>
            <b className={classes.total}>{t`Subtotal`}</b>
          </div>
          <div className={classes.itemValue}>
            <Currency
              currency={'VND'}
              price={order.subtotalAmount}
              freeLabel={showFreeWhenZeroTotal ? t`Free` : null}
            />
          </div>
        </div>
        {order.platformDiscountAmount > 0 && (
          <>
            <div className={classes.separator} />
            <div className={classes.itemRow}>
              <div className={classes.itemName}>{t`Discount`}</div>
              <div className={classes.itemValue}>
                -{' '}
                <Currency
                  currency={'VND'}
                  price={order.platformDiscountAmount}
                />
              </div>
            </div>
          </>
        )}
        <div className={classes.separator} />
        <div className={classes.itemRow}>
          <div className={classes.itemName}>
            <b className={classes.total}>{t`Total`}</b>
          </div>
          <div className={classes.itemValue}>
            <Currency
              currency={'VND'}
              price={
                order.totalAmount
                  ? order.subtotalAmount - order.platformDiscountAmount
                  : order.totalAmount
              }
              freeLabel={showFreeWhenZeroTotal ? t`Free` : null}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
