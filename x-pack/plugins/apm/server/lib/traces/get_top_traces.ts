/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  PARENT_ID,
  PROCESSOR_EVENT,
  TRANSACTION_SAMPLED
} from '../../../common/elasticsearch_fieldnames';
import { rangeFilter } from '../helpers/range_filter';
import { Setup } from '../helpers/setup_request';
import { getTransactionGroups } from '../transaction_groups';
import { ITransactionGroup } from '../transaction_groups/transform';

export type TraceListAPIResponse = ITransactionGroup[];

export async function getTopTraces(
  setup: Setup
): Promise<TraceListAPIResponse> {
  const { start, end } = setup;

  const bodyQuery = {
    bool: {
      // no parent ID means this transaction is a "root" transaction, i.e. a trace
      must_not: { exists: { field: PARENT_ID } },
      filter: [
        { range: rangeFilter(start, end) },
        { term: { [PROCESSOR_EVENT]: 'transaction' } }
      ],
      should: [{ term: { [TRANSACTION_SAMPLED]: true } }]
    }
  };

  return getTransactionGroups(setup, bodyQuery);
}
