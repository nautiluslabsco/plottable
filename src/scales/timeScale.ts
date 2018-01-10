/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import * as Moment from "moment";

import { TimeInterval } from "../axes/timeAxis";

import { QuantitativeScale } from "./quantitativeScale";

export class Time extends QuantitativeScale<Moment.Moment> {
  private _d3Scale: d3.ScaleTime<number, number>;

  /**
   * A Time Scale maps Date objects to numbers.
   *
   * @constructor
   */
  constructor() {
    super();
    this._d3Scale = d3.scaleTime();
    this.autoDomain();
  }

  /**
   * Returns an array of ticks values separated by the specified interval.
   *
   * @param {string} interval A string specifying the interval unit.
   * @param {number?} [step] The number of multiples of the interval between consecutive ticks.
   * @return {Moment.Moment[]}
   */
  public tickInterval(interval: string, step: number = 1): Moment.Moment[] {
    // temporarily creats a time scale from our linear scale into a time scale so we can get access to its api
    const tempScale = d3.scaleTime();
    const d3Interval = Time.timeIntervalToD3Time(interval).every(step);
    tempScale.domain(this.domain());
    tempScale.range(this.range());
    return tempScale.ticks(d3Interval).map(x => Moment(x));
  }

  protected _setDomain(values: Moment.Moment[]) {
    if (values[1] < values[0]) {
      throw new Error("Scale.Time domain values must be in chronological order");
    }
    return super._setDomain(values);
  }

  protected _defaultExtent(): Moment.Moment[] {
    return [Moment("1970-01-01"), Moment("1970-01-02")];
  }

  protected _expandSingleValueDomain(singleValueDomain: Moment.Moment[]): Moment.Moment[] {
    const startTime = singleValueDomain[0].valueOf();
    const endTime = singleValueDomain[1].valueOf();
    if (startTime === endTime) {
      const startDate = Moment(startTime);
      startDate.date(startDate.date() - 1);
      const endDate = Moment(endTime);
      endDate.date(endDate.date() + 1);
      return [startDate, endDate];
    }
    return singleValueDomain;
  }

  public scale(value: Moment.Moment): number {
    return this._d3Scale(value);
  }

  public scaleTransformation(value: number) {
    return this.scale(Moment(value));
  }

  public invertedTransformation(value: number) {
    return this.invert(value).valueOf();
  }

  public getTransformationExtent() {
    const extent = this._getUnboundedExtent(true);
    return [extent[0].valueOf(), extent[1].valueOf()] as [number, number];
  }

  public getTransformationDomain() {
    const dates = this.domain();
    return [dates[0].valueOf(), dates[1].valueOf()] as [number, number];
  }

  public setTransformationDomain([domainMin, domainMax]: [number, number]) {
    this.domain([Moment(domainMin), Moment(domainMax)]);
  }

  protected _getDomain() {
    return this._backingScaleDomain();
  }

  protected _backingScaleDomain(): Moment.Moment[]
  protected _backingScaleDomain(values: Moment.Moment[]): this
  protected _backingScaleDomain(values?: Moment.Moment[]): any {
    if (values == null) {
      return this._d3Scale.domain();
    } else {
      this._d3Scale.domain(values);
      return this;
    }
  }

  protected _getRange() {
    return this._d3Scale.range();
  }

  protected _setRange(values: number[]) {
    this._d3Scale.range(values);
  }

  public invert(value: number) {
    return Moment(this._d3Scale.invert(value));
  }

  public defaultTicks(): Moment.Moment[] {
    return this._d3Scale.ticks(Time._DEFAULT_NUM_TICKS).map(x => Moment(x));
  }

  protected _niceDomain(domain: Moment.Moment[]) {
    return this._d3Scale.copy().domain(domain).nice().domain().map(x => Moment(x);
  }

  /**
   * Transforms the Plottable TimeInterval string into a d3 time interval equivalent.
   * If the provided TimeInterval is incorrect, the default is d3.timeYear
   */
  public static timeIntervalToD3Time(timeInterval: string): d3.CountableTimeInterval {
    switch (timeInterval) {
      case TimeInterval.second:
        return d3.timeSecond;
      case TimeInterval.minute:
        return d3.timeMinute;
      case TimeInterval.hour:
        return d3.timeHour;
      case TimeInterval.day:
        return d3.timeDay;
      case TimeInterval.week:
        return d3.timeWeek;
      case TimeInterval.month:
        return d3.timeMonth;
      case TimeInterval.year:
        return d3.timeYear;
      default:
        throw Error("TimeInterval specified does not exist: " + timeInterval);
    }
  }
}
