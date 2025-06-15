
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ORDER-UTILS] ${step}${detailsStr}`);
};

export const fetchOrderDetails = async (supabaseClient: any, orderId: string) => {
  const { data: order, error: orderError } = await supabaseClient
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        product_name,
        quantity,
        unit_price,
        total_price
      )
    `)
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    logStep("Order not found", { orderId, error: orderError });
    throw new Error("Order not found");
  }

  logStep("Order retrieved", { orderId: order.id, status: order.status, items: order.order_items?.length });
  return order;
};

export const authenticateUser = async (supabaseClient: any, authHeader: string | null) => {
  if (!authHeader) throw new Error("No authorization header provided");

  const token = authHeader.replace("Bearer ", "");
  const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
  if (userError) throw new Error(`Authentication error: ${userError.message}`);
  const user = userData.user;
  if (!user?.email) throw new Error("User not authenticated");

  return user;
};
