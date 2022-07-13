from django.conf import settings
from zerobouncesdk import zerobouncesdk
from zerobouncesdk import ZBValidateStatus
from zerobouncesdk import zb_validate_sub_status
from slugify import slugify
from collections import OrderedDict
from operator import getitem
import json
from email_validator import validate_email, EmailNotValidError

def decorate_country_or_state_region_name(country):
    the_countries = ['Cayman Islands',
                     'Central African Republic',
                     'Channel Islands',
                     'Comoros',
                     'Czech Republic',
                     'Dominican Republic',
                     'Falkland Islands',
                     'Gambia',
                     'Isle of Man',
                     'Ivory Coast',
                     'Leeward Islands',
                     'Maldives',
                     'Marshall Islands',
                     'Netherlands',
                     'Netherlands Antilles',
                     'Philippines',
                     'Solomon Islands',
                     'Turks and Caicos Islands',
                     'United Arab Emirates',
                     'United Kingdom',
                     'United States',
                     'Virgin Islands',
                     'District of Columbia']

    if country in the_countries:
        return f"The {country}"
    else:
        return country


def get_worked_at_locations_as_text(worked_at_records, **kwargs):
    with_prefix = kwargs.pop('with_prefix', True)

    num_countries = 0
    countries_total_weight = 0
    for worked_at_record in worked_at_records:
        if worked_at_record.country:
            num_countries += 1
            countries_total_weight += worked_at_record.weight

    # print(f"{num_countries} countries weighing {countries_total_weight}")

    participating_countries = 0
    countries = []
    total_weight = 0
    total_countries = 0
    enough_countries = False
    for worked_at_record in worked_at_records:
        if worked_at_record.country:
            total_countries += 1
            # print(f"{worked_at_record.country.name} with {worked_at_record.weight}")
            if not enough_countries:
                participating_countries += 1
                total_weight += worked_at_record.weight
                countries.append(worked_at_record.country)
                # print(total_weight / countries_total_weight)
                if (total_weight / countries_total_weight) > 1:
                    enough_countries = True

    # print(
    #    f"{participating_countries}/{total_countries} countr(ies) will participate with  total weigh of  {total_weight}")

    if participating_countries > 0:
        if participating_countries == 1:
            # print(f"single country will take part: {countries[0].name}")
            # how many states/regions are we going to put in?
            participating_states_provinces = []

            total_state_province_weight = 0
            state_province_num = 0
            for worked_at_record in worked_at_records:
                if worked_at_record.state_province and worked_at_record.state_province.country == countries[0]:
                    total_state_province_weight += worked_at_record.weight
                    state_province_num += 1

            state_province_weight = 0
            for worked_at_record in worked_at_records:
                if worked_at_record.state_province and worked_at_record.state_province.country == countries[0]:
                    participating_states_provinces.append(
                        decorate_country_or_state_region_name(worked_at_record.state_province.name))
                    state_province_weight += worked_at_record.weight
                    if state_province_weight / total_state_province_weight > 0.6:
                        break

            if state_province_num == len(participating_states_provinces):
                all_or_some = ", specifically"
            else:
                all_or_some = ", predominately"

            state_provinces = " and ".join(
                [", ".join(participating_states_provinces[:-1]), participating_states_provinces[-1]] if len(
                    participating_states_provinces) > 2 else participating_states_provinces)

            return f"in {decorate_country_or_state_region_name(countries[0])}{all_or_some} in {state_provinces}"

        if participating_countries > 1:
            if participating_countries == total_countries:
                all_or_some = ", specifically"
            else:
                all_or_some = ", predominately"

            country_list = []
            for country in countries:
                country_list.append(decorate_country_or_state_region_name(country.name))

            countries_paragraph = " and ".join(
                [", ".join(country_list[:-1]), country_list[-1]] if len(
                    country_list) > 2 else country_list)

            return f"{all_or_some} in {countries_paragraph}"

    return None


def is_valid_email_syntax(email):
    try:
        # Validate.
        valid = validate_email(email)
        return True, ""
    except EmailNotValidError as e:
        # email is not valid, exception message is human-readable
        return False, str(e)


def slugify_2(slug):
    slug = slug.replace('\'', '')
    return slugify(slug)


def title_with_caps(string):
    return ' '.join([w.title() if w.islower() else w for w in string.split()]).strip()


def quick_verify_email_address(email):
    zerobouncesdk.initialize(settings.API_KEY_ZERO_BOUNCE)
    return zerobouncesdk.validate(email)


def verify_email_address(email):
    from lstv_api_v1.models import EmailVerificationRecord

    def translate_status(status):
        statuses = {

            ZBValidateStatus.valid: 'valid',
            ZBValidateStatus.invalid: 'invalid',
            ZBValidateStatus.catch_all: 'catch_all',
            ZBValidateStatus.unknown: 'unknown',
            ZBValidateStatus.spamtrap: 'spam_trap',
            ZBValidateStatus.abuse: 'abuse',
            ZBValidateStatus.do_not_mail: 'do_not_mail'
        }

        return statuses[status]

    def translate_sub_status(sub_status):
        sub_statuses = {
            zb_validate_sub_status.ZBValidateSubStatus.none: None,
            zb_validate_sub_status.ZBValidateSubStatus.alias_address: "alias_address",
            zb_validate_sub_status.ZBValidateSubStatus.antispam_system: "anti_spam_system",
            zb_validate_sub_status.ZBValidateSubStatus.greylisted: "greylisted",
            zb_validate_sub_status.ZBValidateSubStatus.mail_server_temporary_error: "mail_server_temporary_error",
            zb_validate_sub_status.ZBValidateSubStatus.forcible_disconnect: "forcible_disconnect",
            zb_validate_sub_status.ZBValidateSubStatus.mail_server_did_not_respond: "mail_server_did_not_respond",
            zb_validate_sub_status.ZBValidateSubStatus.timeout_exceeded: "timeout_exceeded",
            zb_validate_sub_status.ZBValidateSubStatus.failed_smtp_connection: "failed_smtp_connection",
            zb_validate_sub_status.ZBValidateSubStatus.mailbox_quota_exceeded: "mailbox_quota_exceeded",
            zb_validate_sub_status.ZBValidateSubStatus.exception_occurred: "exception_occurred",
            zb_validate_sub_status.ZBValidateSubStatus.possible_traps: "possible_traps",
            zb_validate_sub_status.ZBValidateSubStatus.role_based: "role_based",
            zb_validate_sub_status.ZBValidateSubStatus.global_suppression: "global_suppression",
            zb_validate_sub_status.ZBValidateSubStatus.mailbox_not_found: "mailbox_not_found",
            zb_validate_sub_status.ZBValidateSubStatus.no_dns_entries: "no_dns_entries",
            zb_validate_sub_status.ZBValidateSubStatus.failed_syntax_check: "failed_syntax_check",
            zb_validate_sub_status.ZBValidateSubStatus.possible_typo: "possible_typo",
            zb_validate_sub_status.ZBValidateSubStatus.unroutable_ip_address: "unroutable_ip_address",
            zb_validate_sub_status.ZBValidateSubStatus.leading_period_removed: "leading_period_removed",
            zb_validate_sub_status.ZBValidateSubStatus.does_not_accept_mail: "does_not_accept_mail",
            zb_validate_sub_status.ZBValidateSubStatus.role_based_catch_all: "role_based_catch_all",
            zb_validate_sub_status.ZBValidateSubStatus.disposable: "disposable",
            zb_validate_sub_status.ZBValidateSubStatus.toxic: "toxic",
        }

        return sub_statuses[sub_status]

    result = quick_verify_email_address(email)
    rc = EmailVerificationRecord(email=email, status=translate_status(result.status), account=result.account,
                                 domain=result.domain,
                                 sub_status=translate_sub_status(result.sub_status),
                                 free_email_account=result.free_email,
                                 domain_age_days=result.domain_age_days, smtp_provider=result.smtp_provider,
                                 first_name=result.firstname, last_name=result.lastname, gender=result.gender,
                                 country=result.country, region=result.region, city=result.city, zipcode=result.zipcode)

    return rc


def is_email_verification_results_a_go(email_verification_object):
    return email_verification_object.status in [str(ZBValidateStatus.valid), str(ZBValidateStatus.catch_all),
                                                str(ZBValidateStatus.do_not_mail)]
